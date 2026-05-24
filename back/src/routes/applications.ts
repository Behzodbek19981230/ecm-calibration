import path from 'path';
import fs from 'fs';
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendCertificate } from '../bot';
import {
	sendApplicationConfirmation,
	sendApplicationNotification,
	sendRejectionNotification,
	sendContractEmail,
	sendInstrumentsAcceptedEmail,
	sendCompletionEmail,
} from '../email';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const allowed = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png/i;
		cb(null, allowed.test(path.extname(file.originalname)));
	},
});

const applicationSchema = z.object({
	userType: z.enum(['individual', 'legal']),
	fullName: z.string().optional(),
	orgName: z.string().optional(),
	phone: z.string().min(1),
	email: z.string().email(),
	branchRequest: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
	notifyMethod: z.enum(['email', 'telegram']).default('email'),
	telegramChatId: z.string().optional(),
	devices: z.preprocess((v) => {
		if (typeof v === 'string') {
			try {
				return JSON.parse(v);
			} catch {
				return [];
			}
		}
		return v;
	}, z.array(z.any()).default([])),
});

const VALID_STATUSES = ['new', 'contract', 'acceptance', 'laboratory', 'completed', 'rejected'] as const;
type AppStatus = (typeof VALID_STATUSES)[number];

const STATUS_LABELS: Record<AppStatus, string> = {
	new: 'Yangi',
	contract: 'Shartnoma tuzish',
	acceptance: 'Qabul qilish',
	laboratory: 'Laboratoriya tekshiruvida',
	completed: 'Yakunlangan',
	rejected: 'Rad etilgan',
};

// Public: submit application (multipart/form-data)
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
	const result = applicationSchema.safeParse(req.body);
	if (!result.success) {
		if (req.file) fs.unlinkSync(req.file.path);
		res.status(400).json({ error: result.error.flatten() });
		return;
	}

	const { devices, ...rest } = result.data;
	const application = await prisma.application.create({
		data: {
			...rest,
			status: 'new',
			devices: JSON.stringify(devices),
			filePath: req.file ? req.file.filename : null,
		},
	});

	res.status(201).json(application);
});

// Admin: list all (optional ?status= filter)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const { status } = req.query as { status?: string };
	const where = status && (VALID_STATUSES as readonly string[]).includes(status) ? { status } : {};
	const applications = await prisma.application.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		include: { assignedTo: { include: { roles: true } } },
	});
	res.json(applications.map((a) => ({ ...a, devices: JSON.parse(a.devices) })));
});

// Admin: single application
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const app = await prisma.application.findUnique({
		where: { id: Number(req.params.id) },
		include: { assignedTo: { include: { roles: true } }, certificates: true },
	});
	if (!app) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	res.json({ ...app, devices: JSON.parse(app.devices) });
});

// Admin: general update (status + assignedToId)
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const { status, assignedToId } = req.body as { status?: string; assignedToId?: number | null };
	const data: Record<string, unknown> = {};
	if (status && (VALID_STATUSES as readonly string[]).includes(status)) data.status = status;
	if (assignedToId !== undefined) data.assignedToId = assignedToId === null ? null : Number(assignedToId);
	const application = await prisma.application.update({
		where: { id: Number(req.params.id) },
		data,
		include: { assignedTo: { include: { roles: true } } },
	});
	res.json({ ...application, devices: JSON.parse(application.devices) });
});

// Admin: update status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const { status } = req.body as { status: string };
	if (!(VALID_STATUSES as readonly string[]).includes(status)) {
		res.status(400).json({ error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` });
		return;
	}
	const application = await prisma.application.update({
		where: { id: Number(req.params.id) },
		data: { status },
	});
	res.json(application);
});

// Admin: send notification
router.post('/:id/notify', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const application = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
	if (!application) {
		res.status(404).json({ error: 'Not found' });
		return;
	}

	const { message } = req.body as { message?: string };
	const statusLabel = STATUS_LABELS[application.status as AppStatus] ?? application.status;
	const text = message ?? `✅ <b>Sertifikatingiz tayyor!</b>\n\nAriza №${application.id}\nHolat: ${statusLabel}`;

	if (application.notifyMethod === 'telegram' && application.telegramChatId) {
		await sendCertificate(application.telegramChatId, text);
		res.json({ sent: true, method: 'telegram' });
	} else if (application.notifyMethod === 'email' && application.email) {
		const applicantName =
			application.userType === 'individual'
				? (application.fullName ?? application.email)
				: (application.orgName ?? application.email);
		await sendApplicationNotification({
			to: application.email,
			applicantName,
			applicationId: application.id,
			statusLabel,
			message,
		});
		res.json({ sent: true, method: 'email' });
	} else {
		res.json({ sent: false, note: 'Bildirishnoma usuli aniqlanmadi' });
	}
});

// Buyro/lab: accept instruments → move to laboratory + notify
router.post('/:id/accept-instruments', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const userRoles = req.userRoles ?? [];
	if (!userRoles.includes('buyro') && !userRoles.includes('chief_laboratory') && !userRoles.includes('admin')) {
		res.status(403).json({ error: 'Forbidden' });
		return;
	}
	const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
	if (!app) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	if (app.status !== 'acceptance') {
		res.status(400).json({ error: 'Faqat "Qabul qilish" bosqichidagi arizalar uchun' });
		return;
	}

	await prisma.application.update({ where: { id: app.id }, data: { status: 'laboratory' } });

	const applicantName = app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);

	try {
		if (app.notifyMethod === 'telegram' && app.telegramChatId) {
			const date = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
			const text = [
				`📦 <b>O'lchov vositalaringiz qabul qilindi!</b>`,
				``,
				`Ariza №${app.id}`,
				``,
				`Hurmatli ${applicantName},`,
				``,
				`O'lchov vositalaringiz qabul qilindi va laboratoriya tekshiruviga topshirildi.`,
				`Tekshiruv natijalari tayyor bo'lgach, siz bilan bog'lanamiz.`,
				``,
				`ECM CALIBRATION MChJ · ${date}`,
			].join('\n');
			await sendCertificate(app.telegramChatId, text);
		} else if (app.notifyMethod === 'email' && app.email) {
			await sendInstrumentsAcceptedEmail({ to: app.email, applicantName, applicationId: app.id });
		}
	} catch (_e) {}

	res.json({ success: true });
});

// Manager/lab: send contract with price to applicant
router.post('/:id/send-contract', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const userRoles = req.userRoles ?? [];
	if (!userRoles.includes('chief_laboratory') && !userRoles.includes('manager') && !userRoles.includes('admin')) {
		res.status(403).json({ error: 'Forbidden' });
		return;
	}

	const { price } = req.body as { price?: string };
	if (!price?.trim()) {
		res.status(400).json({ error: 'Shartnoma narxi (price) kiritilishi shart' });
		return;
	}

	const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
	if (!app) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	if (app.status !== 'contract') {
		res.status(400).json({ error: 'Shartnoma faqat "Shartnoma tuzish" bosqichida yuboriladi' });
		return;
	}

	const applicantName = app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);

	const date = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

	const REQUISITES = [
		'РЕКВИЗИТЫ:',
		'Наименование: ООО «ECM CALIBRATION»',
		'Юридический адрес: Ташкентская область, Зангиатинский район, Богзор МСГ, ул. Дустлик, дом №8',
		'ИНН: 312 280 517',
		'Телефон/факс: +998 50 303 88 08',
		'E-mail: ecm.calibration.llc@gmail.com',
		'',
		'Банковские реквизиты:',
		'Р/с: 2020 8000 5072 7501 3001 в Ташкент ЦБУ АКБ «Турон банк»',
		'МФО: 00446',
		'Адрес банка: 100011, Республика Узбекистан, г. Ташкент, ул. Абай, 4А',
	].join('\n');

	if (app.notifyMethod === 'telegram' && app.telegramChatId) {
		const text = [
			`📄 <b>Shartnoma №${app.id}</b>`,
			`Sana: ${date}`,
			``,
			`Hurmatli ${applicantName},`,
			``,
			`Ariza №${app.id} bo'yicha shartnoma tayyorlandi.`,
			``,
			`💰 <b>Xizmat narxi / Стоимость услуг:</b>`,
			`<b>${price.trim()}</b>`,
			``,
			REQUISITES,
			``,
			`To'lovni yuqoridagi rekvizitlar bo'yicha amalga oshiring.`,
			`Savollar uchun: +998 50 303 88 08`,
		].join('\n');
		await sendCertificate(app.telegramChatId, text);
		res.json({ sent: true, method: 'telegram' });
	} else if (app.notifyMethod === 'email' && app.email) {
		await sendContractEmail({ to: app.email, applicantName, applicationId: app.id, price: price.trim() });
		res.json({ sent: true, method: 'email' });
	} else {
		res.json({ sent: false, note: 'Bildirishnoma usuli aniqlanmadi' });
	}
});

// Chief laboratory: accept new application → move to contract + notify applicant
router.post('/:id/accept', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const userRoles = req.userRoles ?? [];
	if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin')) {
		res.status(403).json({ error: 'Forbidden' });
		return;
	}
	const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
	if (!app) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	if (app.status !== 'new') {
		res.status(400).json({ error: 'Faqat "yangi" statusdagi arizalarni qabul qilish mumkin' });
		return;
	}

	const updated = await prisma.application.update({
		where: { id: app.id },
		data: { status: 'contract' },
	});

	const applicantName = app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);

	try {
		if (app.notifyMethod === 'telegram' && app.telegramChatId) {
			const text = [
				`✅ <b>Arizangiz qabul qilindi!</b>`,
				``,
				`Ariza №${app.id}`,
				``,
				`Hurmatli ${applicantName},`,
				``,
				`Sizning ariza №${app.id} ko'rib chiqildi va laboratoriya tomonidan qabul qilindi.`,
				`Tez orada shartnoma tuzish bosqichiga o'tiladi. Mutaxassislarimiz siz bilan bog'lanadi.`,
				``,
				`ECM CALIBRATION MChJ`,
			].join('\n');
			await sendCertificate(app.telegramChatId, text);
		} else if (app.notifyMethod === 'email' && app.email) {
			await sendApplicationConfirmation({ to: app.email, applicantName, applicationId: app.id });
		}
	} catch (_e) {
		// Bildirishnoma yuborilmasa ham jarayon to'xtatilmaydi
	}

	res.json({ ...updated, devices: JSON.parse(updated.devices) });
});

// Lab: attach certificate to a specific device in the application
router.post(
	'/:id/attach-certificate',
	requireAuth,
	upload.single('file'),
	async (req: AuthRequest, res: Response): Promise<void> => {
		const userRoles = req.userRoles ?? [];
		if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin') && !userRoles.includes('manager')) {
			res.status(403).json({ error: 'Forbidden' });
			return;
		}

		const { deviceIndex, url } = req.body as { deviceIndex?: string; url?: string };
		if (deviceIndex === undefined) {
			res.status(400).json({ error: 'deviceIndex majburiy' });
			return;
		}
		if (!url?.trim() && !req.file) {
			res.status(400).json({ error: 'URL yoki fayl kiritilishi shart' });
			return;
		}

		const appId = Number(req.params.id);
		const appWithCerts = await prisma.application.findUnique({
			where: { id: appId },
			include: { certificates: true },
		});
		if (!appWithCerts) {
			res.status(404).json({ error: 'Not found' });
			return;
		}
		if (appWithCerts.status !== 'laboratory') {
			res.status(400).json({ error: 'Faqat laboratoriya bosqichidagi arizalar uchun' });
			return;
		}

		const devices: { type: string; serialNumber?: string; measureRange?: string; accuracyClass?: string }[] =
			JSON.parse(appWithCerts.devices);
		const idx = Number(deviceIndex);
		const device = devices[idx];
		if (!device) {
			res.status(400).json({ error: 'Qurilma topilmadi' });
			return;
		}

		const alreadyAttached = appWithCerts.certificates.some((c) => c.deviceIndex === idx);
		if (alreadyAttached) {
			res.status(409).json({ error: 'Bu qurilma uchun sertifikat allaqachon mavjud' });
			return;
		}

		const year = new Date().getFullYear();
		const start = new Date(`${year}-01-01`);
		const count = await prisma.certificate.count({ where: { createdAt: { gte: start } } });
		const certNumber = `ECM-${year}-${String(count + 1).padStart(4, '0')}`;

		const cert = await prisma.certificate.create({
			data: {
				certNumber,
				applicationId: appId,
				issuedById: req.userId!,
				deviceName: device.type,
				serialNumber: device.serialNumber ?? null,
				deviceIndex: idx,
				url: url?.trim() || null,
				filePath: req.file ? req.file.filename : null,
			},
		});
		res.status(201).json(cert);
	},
);

// Lab: mark application as completed + notify applicant
router.post('/:id/complete', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const userRoles = req.userRoles ?? [];
	if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin') && !userRoles.includes('manager')) {
		res.status(403).json({ error: 'Forbidden' });
		return;
	}

	const appWithCerts = await prisma.application.findUnique({
		where: { id: Number(req.params.id) },
		include: { certificates: true },
	});
	if (!appWithCerts) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	if (appWithCerts.status !== 'laboratory') {
		res.status(400).json({ error: 'Faqat laboratoriya bosqichida yakunlash mumkin' });
		return;
	}

	const updated = await prisma.application.update({
		where: { id: appWithCerts.id },
		data: { status: 'completed' },
	});

	const applicantName =
		appWithCerts.userType === 'individual'
			? (appWithCerts.fullName ?? appWithCerts.email)
			: (appWithCerts.orgName ?? appWithCerts.email);

	const appBaseUrl = process.env.APP_URL || 'http://localhost:5000';
	const certs = appWithCerts.certificates;

	try {
		if (appWithCerts.notifyMethod === 'telegram' && appWithCerts.telegramChatId) {
			const certLines = certs.map((c) => {
				const link = c.url || (c.filePath ? `${appBaseUrl}/uploads/${c.filePath}` : null);
				const parts = [
					`📄 <b>${c.certNumber}</b>`,
					c.deviceName ? `   🔧 ${c.deviceName}` : null,
					c.serialNumber ? `   🔢 Zavod raqami: ${c.serialNumber}` : null,
					link ? `   🔗 <a href="${link}">Sertifikatni ko'rish</a>` : null,
				].filter(Boolean);
				return parts.join('\n');
			});

			const text = [
				`✅ <b>Sertifikatlaringiz tayyor!</b>`,
				``,
				`Ariza №${appWithCerts.id}`,
				``,
				`Hurmatli ${applicantName},`,
				``,
				`Laboratoriya tekshiruvi yakunlandi. O'lchov vositalaringizga sertifikatlar berildi:`,
				``,
				...certLines,
				``,
				`Savollar uchun: +998 50 303 88 08`,
				`ECM CALIBRATION MChJ`,
			].join('\n');
			await sendCertificate(appWithCerts.telegramChatId, text);
		} else if (appWithCerts.notifyMethod === 'email' && appWithCerts.email) {
			await sendCompletionEmail({
				to: appWithCerts.email,
				applicantName,
				applicationId: appWithCerts.id,
				certificates: certs.map((c) => ({
					certNumber: c.certNumber,
					deviceName: c.deviceName,
					serialNumber: c.serialNumber,
					url: c.url,
					filePath: c.filePath,
				})),
				appBaseUrl,
			});
		}
	} catch (_e) {}

	res.json({ ...updated, devices: JSON.parse(updated.devices) });
});

// Chief laboratory: reject new application → create rejection letter + notify
router.post('/:id/reject', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
	const userRoles = req.userRoles ?? [];
	if (!userRoles.includes('chief_laboratory') && !userRoles.includes('admin')) {
		res.status(403).json({ error: 'Forbidden' });
		return;
	}

	const { reason } = req.body as { reason?: string };
	if (!reason?.trim()) {
		res.status(400).json({ error: 'Rad etish sababi (reason) kiritilishi shart' });
		return;
	}

	const app = await prisma.application.findUnique({ where: { id: Number(req.params.id) } });
	if (!app) {
		res.status(404).json({ error: 'Not found' });
		return;
	}
	if (app.status !== 'new') {
		res.status(400).json({ error: 'Faqat "yangi" statusdagi arizalarni rad etish mumkin' });
		return;
	}

	const applicantName = app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);

	const rejectedAt = new Date().toLocaleDateString('uz-UZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	const createdAtStr = new Date(app.createdAt).toLocaleDateString('uz-UZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const letterText = [
		'BEKOR QILISH XATI',
		'',
		`Ariza №${app.id}`,
		`Sana: ${rejectedAt}`,
		'',
		`Hurmatli ${applicantName},`,
		'',
		`Siz ${createdAtStr} sanasida ECM CALIBRATION MChJga №${app.id} raqamli kalibrlash arizasi taqdim etdingiz.`,
		'',
		"Ushbu ariza ko'rib chiqildi va quyidagi sabab bilan qabul qilinmadi:",
		'',
		reason.trim(),
		'',
		"Boshqa savollar bo'lsa, iltimos bizning markaz bilan bog'laning.",
		'',
		'Hurmat bilan,',
		'ECM CALIBRATION MChJ',
		"Birinchi laboratoriya boshlig'i",
		`Sana: ${rejectedAt}`,
	].join('\n');

	await prisma.application.update({ where: { id: app.id }, data: { status: 'rejected' } });

	await (prisma as any).rejectionLetter.create({
		data: {
			applicationId: app.id,
			reason: reason.trim(),
			letterText,
			createdById: req.userId!,
		},
	});

	// Send notification to applicant
	try {
		if (app.notifyMethod === 'telegram' && app.telegramChatId) {
			const tgText = `❌ <b>Ariza №${app.id} rad etildi</b>\n\n${letterText.replace(/\n/g, '\n')}`;
			await sendCertificate(app.telegramChatId, tgText);
		} else if (app.notifyMethod === 'email' && app.email) {
			await sendRejectionNotification({
				to: app.email,
				applicantName,
				applicationId: app.id,
				letterText,
			});
		}
	} catch (_e) {
		// Bildirishnoma yuborilmasa ham jarayon to'xtatilmaydi
	}

	res.json({ success: true, letterText });
});

export default router;
