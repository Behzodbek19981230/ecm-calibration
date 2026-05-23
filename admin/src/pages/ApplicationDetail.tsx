import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	User,
	Building2,
	Mail,
	MessageCircle,
	Paperclip,
	Clock,
	CheckCircle,
	Loader2,
	Send,
	FileCheck,
	FlaskConical,
	XCircle,
	ThumbsUp,
	ThumbsDown,
	X,
	FileX,
	ScrollText,
	PackageCheck,
	Award,
	ExternalLink,
} from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';
import { hasRole } from '../lib/auth';
import {
	useAcceptApplication,
	useRejectApplication,
	useSendContract,
	useAcceptInstruments,
	useAttachCertificate,
	useCompleteApplication,
} from '../services/applicationService';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
	new: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
	contract: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
	acceptance: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
	laboratory: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900',
	completed: 'text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
	rejected: 'text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
};

function StatusIcon({ status, size = 12 }: { status: string; size?: number }) {
	if (status === 'new') return <Clock size={size} />;
	if (status === 'contract') return <FileCheck size={size} />;
	if (status === 'acceptance') return <Loader2 size={size} className='animate-spin' />;
	if (status === 'laboratory') return <FlaskConical size={size} />;
	if (status === 'completed') return <CheckCircle size={size} />;
	if (status === 'rejected') return <XCircle size={size} />;
	return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<p className='text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1'>
				{label}
			</p>
			<div className='text-sm text-gray-800 dark:text-slate-100'>{children}</div>
		</div>
	);
}

function RejectModal({
	onClose,
	onConfirm,
	loading,
}: {
	onClose: () => void;
	onConfirm: (reason: string) => void;
	loading: boolean;
}) {
	const [reason, setReason] = useState('');

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
			<div className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700'>
					<div className='flex items-center gap-2'>
						<FileX size={18} className='text-red-500' />
						<h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>
							Bekor qilish xatini shakllantirish
						</h2>
					</div>
					<button
						onClick={onClose}
						className='p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
					>
						<X size={16} />
					</button>
				</div>
				<div className='p-5 space-y-3'>
					<p className='text-xs text-gray-500 dark:text-slate-400'>
						Rad etish sababini kiriting. Bu matn arizachiga xat ko'rinishida yuboriladi.
					</p>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={5}
						placeholder="Masalan: Taqdim etilgan qurilmalar ro'yxati to'liq emas. Iltimos, barcha asbob-uskunalar seriya raqamlari bilan qayta yuboring..."
						className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none'
					/>
				</div>
				<div className='px-5 pb-5 flex gap-2 justify-end'>
					<button
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors'
					>
						Bekor qilish
					</button>
					<button
						onClick={() => onConfirm(reason)}
						disabled={loading || !reason.trim()}
						className='px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2'
					>
						{loading ? <Loader2 size={14} className='animate-spin' /> : <FileX size={14} />}
						Xat shakllantirish va yuborish
					</button>
				</div>
			</div>
		</div>
	);
}

function formatMoney(raw: string): string {
	const digits = raw.replace(/\D/g, '');
	if (!digits) return '';
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function ContractModal({
	notifyMethod,
	onClose,
	onConfirm,
	loading,
}: {
	notifyMethod: string;
	onClose: () => void;
	onConfirm: (price: string) => void;
	loading: boolean;
}) {
	const [raw, setRaw] = useState('');
	const formatted = formatMoney(raw);
	const displayPrice = formatted ? `${formatted} so'm` : '';

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const digits = e.target.value.replace(/\D/g, '');
		setRaw(digits);
	}

	const channel = notifyMethod === 'telegram' ? 'Telegram' : 'Email';

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
			<div className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700'>
					<div className='flex items-center gap-2'>
						<ScrollText size={18} className='text-purple-500' />
						<h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>Shartnoma yuborish</h2>
					</div>
					<button
						onClick={onClose}
						className='p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
					>
						<X size={16} />
					</button>
				</div>

				<div className='p-5 space-y-4'>
					<div className='text-xs text-gray-500 dark:text-slate-400 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl px-4 py-3 space-y-1'>
						<p className='font-semibold text-purple-700 dark:text-purple-400'>
							Rekvizitlar avtomatik qo'shiladi:
						</p>
						<p>ООО «ECM CALIBRATION» · ИНН 312 280 517</p>
						<p>Р/с: 2020 8000 5072 7501 3001 · АКБ «Турон банк» · МФО 00446</p>
					</div>

					<div>
						<label className='block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5'>
							Xizmat narxi / Стоимость услуг <span className='text-red-500'>*</span>
						</label>
						<div className='flex items-center gap-2'>
							<div className='relative flex-1'>
								<input
									type='text'
									inputMode='numeric'
									value={formatted}
									onChange={handleChange}
									placeholder='0'
									className='w-full px-3 py-2.5 pr-14 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-right font-mono'
								/>
								<span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 dark:text-slate-500 pointer-events-none'>
									so'm
								</span>
							</div>
						</div>
						{displayPrice && (
							<p className='mt-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium'>
								= {displayPrice}
							</p>
						)}
					</div>

					<p className='text-xs text-gray-400 dark:text-slate-500'>
						Shartnoma <strong className='text-gray-600 dark:text-slate-300'>{channel}</strong> orqali
						arizachiga yuboriladi.
					</p>
				</div>

				<div className='px-5 pb-5 flex gap-2 justify-end'>
					<button
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors'
					>
						Bekor qilish
					</button>
					<button
						onClick={() => onConfirm(displayPrice)}
						disabled={loading || !raw}
						className='px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2'
					>
						{loading ? <Loader2 size={14} className='animate-spin' /> : <Send size={14} />}
						Yuborish
					</button>
				</div>
			</div>
		</div>
	);
}

const API_URL_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function AttachCertModal({
	deviceName,
	serialNumber,
	onClose,
	onConfirm,
	loading,
}: {
	deviceName: string;
	serialNumber?: string;
	onClose: () => void;
	onConfirm: (url: string, file?: File) => void;
	loading: boolean;
}) {
	const [url, setUrl] = useState('');
	const fileRef = useRef<HTMLInputElement>(null);

	const hasUrl = url.trim().length > 0;
	const hasFile = () => (fileRef.current?.files?.length ?? 0) > 0;
	const [fileSelected, setFileSelected] = useState(false);
	const canSubmit = hasUrl || fileSelected;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
			<div className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700'>
					<div className='flex items-center gap-2'>
						<Award size={18} className='text-teal-500' />
						<h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>
							Sertifikat biriktirish
						</h2>
					</div>
					<button onClick={onClose} className='p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'>
						<X size={16} />
					</button>
				</div>
				<div className='p-5 space-y-4'>
					<div className='p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900'>
						<p className='text-xs font-semibold text-teal-700 dark:text-teal-400'>{deviceName}</p>
						{serialNumber && (
							<p className='text-xs text-teal-600 dark:text-teal-500 mt-0.5'>Zavod raqami: {serialNumber}</p>
						)}
					</div>

					<p className='text-xs text-gray-400 dark:text-slate-500'>
						URL <strong>yoki</strong> fayl — kamida biri majburiy
					</p>

					<div>
						<label className='block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5'>
							Sertifikat URL
						</label>
						<input
							type='url'
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder='https://...'
							className='w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400'
						/>
					</div>

					<div className='flex items-center gap-3'>
						<div className='flex-1 border-t border-gray-100 dark:border-slate-700' />
						<span className='text-xs text-gray-400 dark:text-slate-500 font-medium'>yoki</span>
						<div className='flex-1 border-t border-gray-100 dark:border-slate-700' />
					</div>

					<div>
						<label className='block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5'>
							Sertifikat fayli (PDF / rasm)
						</label>
						<input
							ref={fileRef}
							type='file'
							accept='.pdf,.jpg,.jpeg,.png'
							onChange={() => setFileSelected(hasFile())}
							className='w-full text-sm text-gray-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-slate-700 file:text-gray-700 dark:file:text-slate-300'
						/>
					</div>
				</div>
				<div className='px-5 pb-5 flex gap-2 justify-end'>
					<button
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors'
					>
						Bekor qilish
					</button>
					<button
						onClick={() => onConfirm(url.trim(), fileRef.current?.files?.[0])}
						disabled={loading || !canSubmit}
						className='px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2'
					>
						{loading ? <Loader2 size={14} className='animate-spin' /> : <Award size={14} />}
						Biriktirish
					</button>
				</div>
			</div>
		</div>
	);
}

export default function ApplicationDetail() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t } = useLang();
	const a = t.applications;

	const isChiefLab = hasRole('chief_laboratory');
	const isAdmin = hasRole('admin');
	const isManager = hasRole('manager');
	const isBuyro = hasRole('buyro');
	const canDecide = isChiefLab || isAdmin;
	const canContract = isChiefLab || isManager || isAdmin;
	const canAcceptInstruments = isBuyro || isChiefLab || isAdmin;

	const [app, setApp] = useState<Application | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [notifying, setNotifying] = useState(false);
	const [notifyDone, setNotifyDone] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [showContractModal, setShowContractModal] = useState(false);
	const [contractSent, setContractSent] = useState(false);
	const [actionDone, setActionDone] = useState<'accepted' | 'rejected' | null>(null);

	const acceptMutation = useAcceptApplication();
	const rejectMutation = useRejectApplication();
	const contractMutation = useSendContract();
	const instrumentsMutation = useAcceptInstruments();
	const attachCertMutation = useAttachCertificate(Number(id));
	const completeMutation = useCompleteApplication();

	const [attachingDeviceIdx, setAttachingDeviceIdx] = useState<number | null>(null);

	useEffect(() => {
		api.get(`/applications/${id}`)
			.then((r) => setApp(r.data))
			.finally(() => setLoading(false));
	}, [id]);

	async function updateStatus(status: string) {
		if (!app) return;
		setUpdating(true);
		try {
			const { data } = await api.patch(`/applications/${app.id}/status`, { status });
			setApp((p) => (p ? { ...p, status: data.status } : p));
		} finally {
			setUpdating(false);
		}
	}

	async function handleAccept() {
		if (!app) return;
		await acceptMutation.mutateAsync(app.id);
		setApp((p) => (p ? { ...p, status: 'contract' } : p));
		setActionDone('accepted');
	}

	async function handleReject(reason: string) {
		if (!app) return;
		await rejectMutation.mutateAsync({ id: app.id, reason });
		setApp((p) => (p ? { ...p, status: 'rejected' } : p));
		setShowRejectModal(false);
		setActionDone('rejected');
	}

	async function handleSendContract(price: string) {
		if (!app) return;
		await contractMutation.mutateAsync({ id: app.id, price });
		setShowContractModal(false);
		setContractSent(true);
	}

	async function handleAttachCert(url: string, file?: File) {
		if (attachingDeviceIdx === null || !app) return;
		const fd = new FormData();
		fd.append('deviceIndex', String(attachingDeviceIdx));
		if (url) fd.append('url', url);
		if (file) fd.append('file', file);
		const cert = await attachCertMutation.mutateAsync(fd);
		setApp((p) => p ? { ...p, certificates: [...(p.certificates ?? []), cert] } : p);
		setAttachingDeviceIdx(null);
	}

	async function sendNotify() {
		if (!app) return;
		setNotifying(true);
		try {
			await api.post(`/applications/${app.id}/notify`);
			setNotifyDone(true);
			setTimeout(() => setNotifyDone(false), 3000);
		} finally {
			setNotifying(false);
		}
	}

	if (loading)
		return (
			<div className='flex items-center justify-center h-64'>
				<div
					className='w-6 h-6 border-2 border-t-transparent rounded-full animate-spin'
					style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }}
				/>
			</div>
		);

	if (!app)
		return (
			<div className='p-8 text-center text-gray-400 dark:text-slate-500'>
				<p>Ariza topilmadi</p>
				<button onClick={() => navigate('/applications')} className='mt-3 text-sm underline'>
					{a.title}
				</button>
			</div>
		);

	const devices = app.devices as {
		type: string;
		serialNumber?: string;
		measureRange?: string;
		accuracyClass?: string;
	}[];
	const isNew = app.status === 'new';

	return (
		<>
			{showRejectModal && (
				<RejectModal
					onClose={() => setShowRejectModal(false)}
					onConfirm={handleReject}
					loading={rejectMutation.isPending}
				/>
			)}
			{showContractModal && app && (
				<ContractModal
					notifyMethod={app.notifyMethod}
					onClose={() => setShowContractModal(false)}
					onConfirm={handleSendContract}
					loading={contractMutation.isPending}
				/>
			)}
			{attachingDeviceIdx !== null && app && (() => {
				const devs = app.devices as { type: string; serialNumber?: string }[];
				const d = devs[attachingDeviceIdx];
				return d ? (
					<AttachCertModal
						deviceName={d.type}
						serialNumber={d.serialNumber}
						onClose={() => setAttachingDeviceIdx(null)}
						onConfirm={handleAttachCert}
						loading={attachCertMutation.isPending}
					/>
				) : null;
			})()}

			<div className='p-4 sm:p-6 lg:p-8 max-w-4xl'>
				{/* Header */}
				<div className='flex items-center gap-3 mb-6'>
					<button
						onClick={() => navigate(-1)}
						className='p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors'
					>
						<ArrowLeft size={18} />
					</button>
					<div>
						<h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>
							{a.appNum}
							{app.id}
						</h1>
						<p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5'>
							{new Date(app.createdAt).toLocaleString('uz-UZ')}
						</p>
					</div>
					<div className='ml-auto'>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[app.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
						>
							<StatusIcon status={app.status} />
							{t.status[app.status as keyof typeof t.status] ?? app.status}
						</span>
					</div>
				</div>

				{/* Action result banner */}
				{actionDone === 'accepted' && (
					<div className='mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 flex items-center gap-3 text-sm text-green-700 dark:text-green-400'>
						<CheckCircle size={16} />
						Ariza qabul qilindi. Status "Shartnoma tuzish" ga o'tkazildi.
					</div>
				)}
				{actionDone === 'rejected' && (
					<div className='mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-3 text-sm text-red-700 dark:text-red-400'>
						<XCircle size={16} />
						Ariza rad etildi. Bekor qilish xati shakllandi va arizachiga yuborildi.
					</div>
				)}

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
					{/* Left: main info */}
					<div className='lg:col-span-2 space-y-4'>
						{/* Applicant */}
						<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4'>
							<div className='flex items-center gap-2'>
								<div className='w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950'>
									{app.userType === 'individual' ? (
										<User size={14} className='text-blue-500' />
									) : (
										<Building2 size={14} className='text-blue-500' />
									)}
								</div>
								<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
									{a.detailApplicant}
								</h2>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<Field label={app.userType === 'individual' ? t.users.fullName : t.users.login}>
									{app.userType === 'individual' ? app.fullName || '—' : app.orgName || '—'}
								</Field>
								<Field label={t.common.status}>
									<span className='text-gray-500 dark:text-slate-400'>
										{app.userType === 'individual' ? a.individual : a.legal}
										{app.branchRequest && (
											<span className='ml-1 text-xs text-orange-500'>{a.branch}</span>
										)}
									</span>
								</Field>
								<Field label={t.contacts.cols.email}>
									<a
										href={`mailto:${app.email}`}
										className='hover:underline'
										style={{ color: 'hsl(205,45%,30%)' }}
									>
										{app.email}
									</a>
								</Field>
								<Field label={a.detailContact}>
									<a
										href={`tel:${app.phone}`}
										className='hover:underline text-gray-700 dark:text-slate-200'
									>
										{app.phone}
									</a>
								</Field>
							</div>
						</div>

						{/* Notification method */}
						<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
							<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3'>
								{a.detailNotify}
							</h2>
							<span
								className={`inline-flex items-center gap-1.5 text-sm font-medium ${app.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-600 dark:text-slate-300'}`}
							>
								{app.notifyMethod === 'telegram' ? (
									<>
										<MessageCircle size={15} /> Telegram
									</>
								) : (
									<>
										<Mail size={15} /> Email — {app.email}
									</>
								)}
							</span>
						</div>

						{/* Devices */}
						<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
							<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3'>
								{a.detailDevices}
								<span className='text-gray-400 dark:text-slate-500 font-normal ml-1'>
									({devices.length})
								</span>
							</h2>
							{devices.length === 0 ? (
								<p className='text-sm text-gray-400 dark:text-slate-500'>{a.noDevices}</p>
							) : (
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
									{devices.map((d, i) => (
										<div
											key={i}
											className='p-3 rounded-xl bg-gray-50 dark:bg-slate-700/60 space-y-1'
										>
											<div className='flex items-center gap-2'>
												<span
													className='w-5 h-5 rounded-md text-[10px] font-bold text-white flex items-center justify-center shrink-0'
													style={{ background: 'hsl(205,45%,25%)' }}
												>
													{i + 1}
												</span>
												<p className='text-sm font-semibold text-gray-800 dark:text-slate-100 leading-tight'>
													{d.type}
												</p>
											</div>
											<div className='pl-7 space-y-0.5'>
												{d.accuracyClass && (
													<p className='text-xs text-gray-500 dark:text-slate-400'>
														{d.accuracyClass}
													</p>
												)}
												{d.measureRange && (
													<p className='text-xs text-gray-500 dark:text-slate-400'>
														{d.measureRange}
													</p>
												)}
												{d.serialNumber && (
													<p className='text-xs text-gray-500 dark:text-slate-400'>
														№ {d.serialNumber}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Laboratory: certificate attachment per device */}
						{app.status === 'laboratory' && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<div className='flex items-center gap-2 mb-3'>
									<Award size={15} className='text-teal-500' />
									<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
										Sertifikatlar biriktirish
									</h2>
								</div>
								{devices.length === 0 ? (
									<p className='text-sm text-gray-400 dark:text-slate-500'>O'lchov vositalari mavjud emas</p>
								) : (
									<div className='space-y-2'>
										{devices.map((d, i) => {
											const device = d as { type: string; serialNumber?: string };
											const cert = (app.certificates ?? []).find((c) => c.deviceIndex === i);
											return (
												<div key={i} className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/60'>
													<div className='flex-1 min-w-0'>
														<p className='text-sm font-medium text-gray-800 dark:text-slate-100 truncate'>{device.type}</p>
														{device.serialNumber ? (
															<p className='text-xs text-gray-400 dark:text-slate-500'>SN: {device.serialNumber}</p>
														) : (
															<p className='text-xs text-gray-400 dark:text-slate-500'>Zavod raqamisiz</p>
														)}
													</div>
													{cert ? (
														<div className='flex items-center gap-2 shrink-0'>
															<span className='text-xs font-mono text-teal-600 dark:text-teal-400'>{cert.certNumber}</span>
															{(cert.filePath || cert.url) && (
																<a
																	href={cert.url || `${API_URL_BASE}/uploads/${cert.filePath}`}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='p-1 text-gray-400 hover:text-blue-500 rounded transition-colors'
																>
																	<ExternalLink size={13} />
																</a>
															)}
															<CheckCircle size={15} className='text-green-500' />
														</div>
													) : (
														<button
															onClick={() => setAttachingDeviceIdx(i)}
															className='shrink-0 text-xs px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-colors'
														>
															Biriktirish
														</button>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* Attached file */}
						{app.filePath && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2'>
									{a.detailAttach}
								</h2>
								<a
									href={`${API_URL}/uploads/${app.filePath}`}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 text-sm font-medium hover:underline'
									style={{ color: 'hsl(205,45%,28%)' }}
								>
									<Paperclip size={14} />
									{a.viewFile}
								</a>
							</div>
						)}
					</div>

					{/* Right: actions */}
					<div className='space-y-4'>
						{/* Chief laboratory: Accept / Reject for new applications */}
						{canDecide && isNew && !actionDone && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1'>
									Laboratoriya qarori
								</h2>
								<p className='text-xs text-gray-400 dark:text-slate-500 mb-4'>
									Yangi arizani qabul qiling yoki rad eting
								</p>
								<div className='space-y-2'>
									<button
										onClick={handleAccept}
										disabled={acceptMutation.isPending}
										className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors'
									>
										{acceptMutation.isPending ? (
											<Loader2 size={14} className='animate-spin' />
										) : (
											<ThumbsUp size={14} />
										)}
										Qabul qilish
									</button>
									<button
										onClick={() => setShowRejectModal(true)}
										disabled={acceptMutation.isPending}
										className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors'
									>
										<ThumbsDown size={14} />
										Rad etish
									</button>
								</div>
							</div>
						)}

						{/* Contract stage: send contract + paid buttons */}
						{canContract && app.status === 'contract' && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<div className='flex items-center gap-2 mb-1'>
									<ScrollText size={15} className='text-purple-500' />
									<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
										Shartnoma bosqichi
									</h2>
								</div>
								<p className='text-xs text-gray-400 dark:text-slate-500 mb-4'>
									Shartnomani yuboring, to'lov qilingach keyingi bosqichga o'ting.
								</p>
								<div className='space-y-2'>
									{contractSent ? (
										<div className='flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium px-1'>
											<CheckCircle size={15} />
											Shartnoma yuborildi!
										</div>
									) : (
										<button
											onClick={() => setShowContractModal(true)}
											className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors'
										>
											<ScrollText size={14} />
											Shartnoma yuborish
										</button>
									)}
									<button
										onClick={() => updateStatus('acceptance')}
										disabled={updating}
										className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors'
									>
										{updating ? (
											<Loader2 size={14} className='animate-spin' />
										) : (
											<CheckCircle size={14} />
										)}
										To'landi
									</button>
								</div>
							</div>
						)}

						{/* Acceptance stage: receive instruments */}
						{canAcceptInstruments && app.status === 'acceptance' && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<div className='flex items-center gap-2 mb-1'>
									<PackageCheck size={15} className='text-amber-500' />
									<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
										Qabul qilish bosqichi
									</h2>
								</div>
								<p className='text-xs text-gray-500 dark:text-slate-400 mb-3'>
									O'lchov vositalarini qabul qilgach laboratoriya tekshiruviga o'tkazing.
								</p>
								<button
									onClick={async () => {
										if (!app) return;
										await instrumentsMutation.mutateAsync(app.id);
										setApp((p) => p ? { ...p, status: 'laboratory' } : p);
									}}
									disabled={instrumentsMutation.isPending}
									className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors'
								>
									{instrumentsMutation.isPending
										? <Loader2 size={14} className='animate-spin' />
										: <PackageCheck size={14} />}
									O'lchov vositalarini qabul qilish
								</button>
							</div>
						)}

						{/* Laboratory complete button */}
						{(isChiefLab || isAdmin || isManager) && app.status === 'laboratory' && (() => {
							const certs = app.certificates ?? [];
							const allAttached = devices.length > 0 && devices.every((_, i) => certs.some((c) => c.deviceIndex === i));
							return (
								<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
									<div className='flex items-center gap-2 mb-1'>
										<FlaskConical size={15} className='text-teal-500' />
										<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
											Laboratoriya bosqichi
										</h2>
									</div>
									<p className='text-xs text-gray-400 dark:text-slate-500 mb-3'>
										{allAttached
											? 'Barcha sertifikatlar biriktirildi. Yakunlash mumkin.'
											: `${certs.length}/${devices.length} sertifikat biriktirildi.`}
									</p>
									<button
										onClick={async () => {
											if (!app) return;
											await completeMutation.mutateAsync(app.id);
											setApp((p) => p ? { ...p, status: 'completed' } : p);
										}}
										disabled={completeMutation.isPending || !allAttached}
										className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors'
									>
										{completeMutation.isPending
											? <Loader2 size={14} className='animate-spin' />
											: <CheckCircle size={14} />}
										Yakunlash
									</button>
								</div>
							);
						})()}

						{/* Rejected info */}
						{app.status === 'rejected' && (
							<div className='bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 p-5'>
								<div className='flex items-center gap-2 mb-2'>
									<XCircle size={15} className='text-red-500' />
									<h2 className='text-sm font-semibold text-red-700 dark:text-red-400'>
										Ariza rad etilgan
									</h2>
								</div>
								<p className='text-xs text-red-600 dark:text-red-400'>
									Bekor qilish xatini ko'rish uchun "Bekor qilish xatlari" bo'limiga o'ting.
								</p>
							</div>
						)}

						{/* Status step bar */}
						{(() => {
							const STEPS = [
								{ key: 'new',        Icon: Clock,        label: t.status.new,        bg: 'bg-blue-500' },
								{ key: 'contract',   Icon: FileCheck,    label: t.status.contract,   bg: 'bg-purple-500' },
								{ key: 'acceptance', Icon: PackageCheck, label: t.status.acceptance, bg: 'bg-amber-500' },
								{ key: 'laboratory', Icon: FlaskConical, label: t.status.laboratory, bg: 'bg-teal-500' },
								{ key: 'completed',  Icon: CheckCircle,  label: t.status.completed,  bg: 'bg-green-500' },
							];
							const currentIdx = STEPS.findIndex((s) => s.key === app.status);
							const isRejected = app.status === 'rejected';
							return (
								<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
									<h2 className='text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4'>
										Jarayon holati
									</h2>
									<div>
										{STEPS.map(({ key, Icon, label, bg }, i) => {
											const isDone   = !isRejected && i < currentIdx;
											const isActive = !isRejected && i === currentIdx;
											const isFuture = isRejected  || i > currentIdx;
											return (
												<div key={key} className='flex items-start gap-3'>
													<div className='flex flex-col items-center shrink-0'>
														<div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
															isDone   ? 'bg-green-500' :
															isActive ? bg :
															'bg-gray-100 dark:bg-slate-700'
														}`}>
															{isDone
																? <CheckCircle size={13} className='text-white' />
																: <Icon size={13} className={isFuture ? 'text-gray-400 dark:text-slate-500' : 'text-white'} />
															}
														</div>
														{i < STEPS.length - 1 && (
															<div className={`w-0.5 h-6 ${isDone ? 'bg-green-300 dark:bg-green-800' : 'bg-gray-100 dark:bg-slate-700'}`} />
														)}
													</div>
													<div className={`pt-1 ${i < STEPS.length - 1 ? 'pb-1' : ''}`}>
														<p className={`text-xs font-semibold leading-tight ${
															isActive ? 'text-gray-800 dark:text-slate-100' :
															isDone   ? 'text-gray-500 dark:text-slate-400' :
															'text-gray-300 dark:text-slate-600'
														}`}>
															{label}
														</p>
														{isActive && (
															<p className='text-[10px] text-gray-400 dark:text-slate-500 mt-0.5'>Hozirgi holat</p>
														)}
													</div>
												</div>
											);
										})}
									</div>
									{isRejected && (
										<div className='mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900'>
											<XCircle size={14} className='text-red-500 shrink-0' />
											<span className='text-xs font-semibold text-red-600 dark:text-red-400'>
												{t.status.rejected ?? 'Rad etilgan'}
											</span>
										</div>
									)}
								</div>
							);
						})()}

						{/* Notify */}
						{!canDecide && (
							<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
								<h2 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1'>
									{a.sendNotify}
								</h2>
								<p className='text-xs text-gray-400 dark:text-slate-500 mb-3'>
									{app.notifyMethod === 'telegram' ? 'Telegram' : 'Email'} orqali yuboriladi
								</p>
								<button
									onClick={sendNotify}
									disabled={notifying || notifyDone}
									className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60'
									style={{ background: notifyDone ? '#16a34a' : 'hsl(205,45%,25%)' }}
								>
									{notifying ? (
										<Loader2 size={15} className='animate-spin' />
									) : notifyDone ? (
										<CheckCircle size={15} />
									) : (
										<Send size={15} />
									)}
									{notifying ? 'Yuborilmoqda...' : notifyDone ? 'Yuborildi!' : a.sendNotify}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
