import nodemailer from 'nodemailer';

const FROM = 'ECM CALIBRATION <ecm.calibration.llc@gmail.com>';
const COMPANY_EMAIL = 'ecm.calibration.llc@gmail.com';

function createTransport() {
	return nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth: {
			user: COMPANY_EMAIL,
			pass: process.env.SMTP_PASS,
		},
	});
}

export async function sendApplicationConfirmation(params: {
	to: string;
	applicantName: string;
	applicationId: number;
}): Promise<void> {
	const transporter = createTransport();
	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `Arizangiz qabul qilindi — №${params.applicationId}`,
		html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">✅ Arizangiz qabul qilindi</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <p>
          Arizangiz muvaffaqiyatli yuborildi.
          Ariza raqami: <strong>№${params.applicationId}</strong>
        </p>
        <p>Tez orada mutaxassislarimiz siz bilan bog'lanadi.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">
          ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari
        </p>
      </div>
    `,
	});
}

export async function sendInstrumentsAcceptedEmail(params: {
	to: string;
	applicantName: string;
	applicationId: number;
}): Promise<void> {
	const transporter = createTransport();
	const date = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `O'lchov vositalaringiz qabul qilindi — Ariza №${params.applicationId}`,
		html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">📦 O'lchov vositalaringiz qabul qilindi</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <p>
          Ariza №<strong>${params.applicationId}</strong> bo'yicha O'lchov vositalaringiz
          qabul qilindi va laboratoriya tekshiruviga topshirildi.
        </p>
        <p>Tekshiruv natijalari tayyor bo'lgach, siz bilan bog'lanamiz.</p>
        <p style="font-size:13px;color:#6b7280">Sana: ${date}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari</p>
      </div>
    `,
	});
}

export async function sendContractEmail(params: {
	to: string;
	applicantName: string;
	applicationId: number;
	price: string;
}): Promise<void> {
	const transporter = createTransport();
	const date = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `Shartnoma №${params.applicationId} — ECM CALIBRATION`,
		html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">📄 Shartnoma / Договор №${params.applicationId}</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <p>Sizning ariza №<strong>${params.applicationId}</strong> bo'yicha shartnoma tayyorlandi.</p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:20px 0">
          <p style="margin:0 0 12px;font-weight:600;font-size:15px;color:#1b4060">Xizmat narxi / Стоимость услуг:</p>
          <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f4c81">${params.price}</p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>

          <p style="margin:0 0 8px;font-weight:700;font-size:13px;color:#374151">РЕКВИЗИТЫ:</p>
          <table style="font-size:13px;color:#374151;border-collapse:collapse;width:100%">
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">Наименование:</td><td>ООО «ECM CALIBRATION»</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">Юр. адрес:</td><td>Ташкентская обл., Зангиатинский р-н, Богзор МСГ, ул. Дустлик, д.8</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">ИНН:</td><td>312 280 517</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">Тел/факс:</td><td>+998 50 303 88 08</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">E-mail:</td><td>ecm.calibration.llc@gmail.com</td></tr>
          </table>

          <p style="margin:14px 0 8px;font-weight:700;font-size:13px;color:#374151">Банковские реквизиты:</p>
          <table style="font-size:13px;color:#374151;border-collapse:collapse;width:100%">
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">Р/с:</td><td>2020 8000 5072 7501 3001<br/>Ташкент ЦБУ АКБ «Турон банк»</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">МФО:</td><td>00446</td></tr>
            <tr><td style="padding:3px 0;color:#6b7280;white-space:nowrap;padding-right:12px">Адрес банка:</td><td>100011, г. Ташкент, ул. Абай, 4А</td></tr>
          </table>
        </div>

        <p style="font-size:14px">Shartnomani ko'rib chiqing va to'lovni yuqoridagi rekvizitlar bo'yicha amalga oshiring. Savollar bo'lsa, biz bilan bog'laning: <strong>+998 50 303 88 08</strong></p>
        <p style="font-size:13px;color:#6b7280">Sana / Дата: ${date}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari</p>
      </div>
    `,
	});
}

export async function sendRejectionNotification(params: {
	to: string;
	applicantName: string;
	applicationId: number;
	letterText: string;
}): Promise<void> {
	const transporter = createTransport();
	const htmlText = params.letterText
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\n/g, '<br/>');

	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `Ariza №${params.applicationId} rad etildi — ECM CALIBRATION`,
		html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#b91c1c">❌ Ariza rad etildi</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:4px;margin:20px 0;white-space:pre-wrap;font-size:14px;line-height:1.6">
          ${htmlText}
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">
          ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari
        </p>
      </div>
    `,
	});
}

export async function sendCompletionEmail(params: {
	to: string;
	applicantName: string;
	applicationId: number;
	certificates: Array<{
		certNumber: string;
		deviceName: string | null;
		serialNumber: string | null;
		url: string | null;
		filePath: string | null;
	}>;
	appBaseUrl: string;
}): Promise<void> {
	const transporter = createTransport();
	const date = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

	const rows = params.certificates
		.map((c) => {
			const link = c.url || (c.filePath ? `${params.appBaseUrl}/uploads/${c.filePath}` : null);
			const linkCell = link
				? `<a href="${link}" style="color:#0f4c81;text-decoration:underline;">Ko'rish / Скачать</a>`
				: '—';
			return `
				<tr>
					<td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:600;color:#0f4c81">${c.certNumber}</td>
					<td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#374151">${c.deviceName ?? '—'}</td>
					<td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#6b7280;font-family:monospace">${c.serialNumber ?? '—'}</td>
					<td style="padding:10px 12px;border-bottom:1px solid #e2e8f0">${linkCell}</td>
				</tr>`;
		})
		.join('');

	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `Sertifikatlaringiz tayyor — Ariza №${params.applicationId}`,
		html: `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">✅ Sertifikatlaringiz tayyor!</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <p>
          Ariza №<strong>${params.applicationId}</strong> bo'yicha laboratoriya tekshiruvi yakunlandi.
          O'lchov vositalaringizga quyidagi sertifikatlar berildi:
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0">Sertifikat №</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0">O'lchov vositasi</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0">Zavod raqami</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0">Sertifikat</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p style="font-size:14px">
          Savollar bo'lsa, biz bilan bog'laning: <strong>+998 50 303 88 08</strong>
        </p>
        <p style="font-size:13px;color:#6b7280">Sana: ${date}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari</p>
      </div>
    `,
	});
}

export async function sendApplicationNotification(params: {
	to: string;
	applicantName: string;
	applicationId: number;
	statusLabel: string;
	message?: string;
}): Promise<void> {
	const transporter = createTransport();
	const body = params.message
		? `<p>${params.message.replace(/\n/g, '<br/>')}</p>`
		: `<p>Ariza №<strong>${params.applicationId}</strong> holati yangilandi: <strong>${params.statusLabel}</strong></p>`;

	await transporter.sendMail({
		from: FROM,
		to: params.to,
		subject: `Ariza №${params.applicationId} — ${params.statusLabel}`,
		html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">📋 Ariza holati haqida xabar</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        ${body}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">
          ECM CALIBRATION — kalibrlash va sertifikatlash xizmatlari
        </p>
      </div>
    `,
	});
}
