'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, FileText, Mail, User, ClipboardList } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import TelegramConnect from '@/components/ui/TelegramConnect';
import RadioGroup from '@/components/ui/RadioGroup';
import { useLang } from '@/lib/LanguageContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Device {
	id: number;
	type: string;
	accuracyClass: string;
	measureRange: string;
	serialNumber: string;
	verificationRange: string;
}

interface DeviceForm {
	type: string;
	measureRange: string;
	accuracyClass: string;
	quantityType: string;
	serialNumber: string;
	verificationRange: string;
	checkPoints: { value: string; unit: string }[];
	locationType: string;
	regionId: string;
	districtId: string;
	address: string;
}

const emptyDeviceForm: DeviceForm = {
	type: '',
	measureRange: '',
	accuracyClass: '',
	quantityType: 'serial',
	serialNumber: '',
	verificationRange: 'all',
	checkPoints: [{ value: '', unit: '' }],
	locationType: 'lab',
	regionId: '',
	districtId: '',
	address: '',
};

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
	return (
		<div className='flex items-center gap-2 mb-4'>
			<span
				className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
				style={{ background: 'hsl(205 45% 25% / 0.1)' }}
			>
				<Icon size={14} style={{ color: 'hsl(205 45% 25%)' }} />
			</span>
			<span className='text-sm font-semibold' style={{ color: 'var(--foreground)' }}>{text}</span>
			<span className='flex-1 h-px ml-1' style={{ background: 'var(--border)' }} />
		</div>
	);
}

export default function ApplicationSection() {
	const { t } = useLang();
	const a = t.application;
	const m = a.modal;

	const userTypeOptions = [
		{ value: 'individual', label: a.individual },
		{ value: 'legal', label: a.legal },
	];
	const quantityOptions = [
		{ value: 'serial', label: m.serialBySerial },
		{ value: 'count', label: m.serialByCount },
	];
	const verificationRangeOptions = [
		{ value: 'all', label: m.verificationAll },
		{ value: 'points', label: m.verificationPoints },
	];
	const locationOptions = [
		{ value: 'lab', label: m.locationLab },
		{ value: 'onsite', label: m.locationOnsite },
	];
	const verificationLabel: Record<string, string> = {
		all: m.verificationAll,
		points: m.verificationPoints,
	};

	const [userType, setUserType] = useState('individual');
	const [fullName, setFullName] = useState('');
	const [orgName, setOrgName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [notifyMethod, setNotifyMethod] = useState<'email' | 'telegram'>('email');
	const [telegramChatId, setTelegramChatId] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [submittedId, setSubmittedId] = useState<number | null>(null);
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			alert('Fayl hajmi 5 MB dan oshmasligi kerak');
			e.target.value = '';
			return;
		}
		setAttachedFile(file);
	};

	const [regions, setRegions] = useState<{ id: number; name: string; districts: { id: number; name: string }[] }[]>([]);
	useEffect(() => {
		fetch(`${API}/api/regions`).then((r) => r.json()).then(setRegions).catch(() => {});
	}, []);

	const [devices, setDevices] = useState<Device[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [deviceForm, setDeviceForm] = useState<DeviceForm>(emptyDeviceForm);
	const [nextDeviceId, setNextDeviceId] = useState(1);

	const setField = <K extends keyof DeviceForm>(key: K, val: DeviceForm[K]) =>
		setDeviceForm((p) => ({ ...p, [key]: val }));

	const regionOptions = regions.map((r) => ({ value: String(r.id), label: r.name }));
	const districtOptions =
		regions.find((r) => String(r.id) === deviceForm.regionId)
			?.districts.map((d) => ({ value: String(d.id), label: d.name })) ?? [];

	const addCheckPoint = () => setField('checkPoints', [...deviceForm.checkPoints, { value: '', unit: '' }]);
	const updateCheckPoint = (i: number, field: 'value' | 'unit', val: string) => {
		const pts = [...deviceForm.checkPoints];
		pts[i] = { ...pts[i], [field]: val };
		setField('checkPoints', pts);
	};

	const saveDevice = () => {
		if (!deviceForm.type) return;
		setDevices((prev) => [...prev, {
			id: nextDeviceId,
			type: deviceForm.type,
			accuracyClass: deviceForm.accuracyClass,
			measureRange: deviceForm.measureRange,
			serialNumber: deviceForm.serialNumber,
			verificationRange: deviceForm.verificationRange,
		}]);
		setNextDeviceId((n) => n + 1);
		setModalOpen(false);
	};

	const validate = (): boolean => {
		const errs: Record<string, string> = {};
		const v = a.validation;
		if (userType === 'individual' && !fullName.trim()) errs.fullName = v.required;
		if (userType === 'legal' && !orgName.trim()) errs.orgName = v.required;
		if (!phone.trim()) errs.phone = v.required;
		if (!email.trim()) errs.email = v.required;
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = v.emailInvalid;
		if (devices.length === 0) errs.devices = v.addDevice;
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setSubmitting(true);
		setSubmitStatus('idle');
		try {
			const fd = new FormData();
			fd.append('userType', userType);
			if (userType === 'individual') fd.append('fullName', fullName);
			if (userType === 'legal') fd.append('orgName', orgName);
			fd.append('phone', phone);
			fd.append('email', email);
			fd.append('notifyMethod', notifyMethod);
			if (notifyMethod === 'telegram' && telegramChatId) fd.append('telegramChatId', telegramChatId);
			fd.append('devices', JSON.stringify(devices));
			if (attachedFile) fd.append('file', attachedFile);

			const res = await fetch(`${API}/api/applications`, { method: 'POST', body: fd });
			if (!res.ok) throw new Error();
			const data = await res.json();
			setSubmittedId(data.id ?? null);
			setSubmitStatus('success');
			setAttachedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch {
			setSubmitStatus('error');
		} finally {
			setSubmitting(false);
		}
	};

	const handleReset = () => {
		setSubmitStatus('idle');
		setSubmittedId(null);
		setErrors({});
		setFullName('');
		setOrgName('');
		setPhone('');
		setEmail('');
		setNotifyMethod('email');
		setTelegramChatId('');
		setDevices([]);
		setAttachedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	return (
		<section id='ariza' className='py-16 sm:py-20' style={{ background: 'var(--background)' }}>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>

				{/* Header */}
				<div className='text-center mb-10'>
					<span
						className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3'
						style={{ background: 'hsl(205 45% 25% / 0.08)', color: 'hsl(205 45% 25%)' }}
					>
						<ClipboardList size={12} />
						{a.badge}
					</span>
					<h2
						className='text-2xl sm:text-3xl font-bold mb-2'
						style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
					>
						{a.title}
					</h2>
					<p className='text-sm' style={{ color: 'var(--muted-foreground)' }}>{a.subtitle}</p>
				</div>

				{submitStatus === 'success' && (
					<div
						className='rounded-2xl border overflow-hidden'
						style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
					>
						<div className='flex flex-col items-center text-center px-8 py-16 gap-6'>
							<div
								className='w-20 h-20 rounded-full flex items-center justify-center'
								style={{ background: 'hsl(142 70% 45% / 0.12)' }}
							>
								<svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='hsl(142 70% 38%)' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
									<polyline points='20 6 9 17 4 12' />
								</svg>
							</div>
							<div className='space-y-2'>
								<h3 className='text-xl font-bold' style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}>
									{a.successTitle}
								</h3>
								{submittedId && (
									<p className='text-sm font-medium' style={{ color: 'hsl(205 45% 30%)' }}>
										{a.successId}: <strong>#{submittedId}</strong>
									</p>
								)}
								<p className='text-sm max-w-sm mx-auto' style={{ color: 'var(--muted-foreground)' }}>
									{notifyMethod === 'email'
										? a.successEmail.replace('{email}', email)
										: a.successTelegram}
								</p>
							</div>
							<button
								type='button'
								onClick={handleReset}
								className='mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all'
								style={{ background: 'var(--gradient-hero)' }}
							>
								<Plus size={15} />
								{a.successNewApp}
							</button>
						</div>
					</div>
				)}

				{submitStatus !== 'success' && (
				<div
					className='rounded-2xl border overflow-hidden'
					style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.06)' }}
				>
					<div className='p-6 sm:p-8 space-y-8'>

						{/* — Applicant — */}
						<div>
							<SectionLabel icon={User} text={a.applicantSection} />
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<Select
									label={a.userType}
									options={userTypeOptions}
									value={userType}
									onChange={setUserType}
								/>
								{userType === 'individual' ? (
									<Input label={a.fullName} value={fullName} onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }} placeholder={a.fullNamePlaceholder} error={errors.fullName} />
								) : (
									<Input label={a.orgName} value={orgName} onChange={(e) => { setOrgName(e.target.value); setErrors((p) => ({ ...p, orgName: '' })); }} placeholder={a.orgNamePlaceholder} error={errors.orgName} />
								)}
								<Input label={a.phone} type='tel' value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }} placeholder='+998 XX XXX XX XX' error={errors.phone} />
								<Input label={a.email} type='email' value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }} placeholder='example@mail.com' error={errors.email} />
							</div>
						</div>

						{/* — Notification — */}
						<div>
							<SectionLabel icon={Mail} text={a.notifySection} />
							<div className='flex flex-wrap gap-2 mb-4'>
								<button
									type='button'
									onClick={() => setNotifyMethod('email')}
									className={[
										'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
										notifyMethod === 'email'
											? 'text-white border-transparent shadow-sm'
											: 'bg-white border-border text-foreground hover:border-primary-light hover:bg-[hsl(210_15%_97%)]',
									].join(' ')}
									style={notifyMethod === 'email' ? { background: 'var(--gradient-hero)' } : {}}
								>
									<Mail size={15} />
									Email
								</button>

								<button
									type='button'
									onClick={() => setNotifyMethod('telegram')}
									className={[
										'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
										notifyMethod === 'telegram'
											? 'text-white border-transparent shadow-sm'
											: 'bg-white border-border text-foreground hover:border-[#0088CC] hover:bg-[hsl(200_100%_97%)]',
									].join(' ')}
									style={notifyMethod === 'telegram' ? { background: '#0088CC' } : {}}
								>
									<svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor'>
										<path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
									</svg>
									Telegram
								</button>
							</div>

							{notifyMethod === 'email' && (
								<div
									className='flex items-start gap-3 px-4 py-3 rounded-xl text-sm'
									style={{ background: 'hsl(205 45% 25% / 0.05)', color: 'hsl(205 45% 30%)' }}
								>
									<Mail size={15} className='mt-0.5 shrink-0' />
									<span>
										{a.emailNotify.split('{email}')[0]}
										<strong>{email || a.emailNotifyDefault}</strong>
										{a.emailNotify.split('{email}')[1]}
									</span>
								</div>
							)}
							{notifyMethod === 'telegram' && (
								<div className='max-w-sm'>
									<TelegramConnect
										onConnect={(chatId) => setTelegramChatId(chatId)}
										onDisconnect={() => setTelegramChatId('')}
									/>
								</div>
							)}
						</div>

						{/* — Devices — */}
						<div>
							<SectionLabel icon={ClipboardList} text={a.devicesSection} />

							{devices.length === 0 ? (
								<div
									className='rounded-xl border-2 border-dashed py-10 flex flex-col items-center gap-2 mb-4'
									style={{ borderColor: 'var(--border)' }}
								>
									<FileText size={30} style={{ color: 'var(--muted-foreground)', opacity: 0.25 }} />
									<span className='text-sm' style={{ color: 'var(--muted-foreground)' }}>{a.emptyDevices}</span>
								</div>
							) : (
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
									{devices.map((d, index) => (
										<div
											key={d.id}
											className='flex flex-col gap-3 p-4 rounded-xl border transition-all hover:shadow-sm'
											style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
										>
											{/* Card header */}
											<div className='flex items-start justify-between gap-2'>
												<div className='flex items-center gap-2.5 min-w-0'>
													<span
														className='w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-white'
														style={{ background: 'hsl(205 45% 25%)' }}
													>
														{index + 1}
													</span>
													<p className='font-semibold text-sm leading-snug' style={{ color: 'var(--foreground)' }}>
														{d.type}
													</p>
												</div>
												<button
													type='button'
													onClick={() => setDevices((p) => p.filter((x) => x.id !== d.id))}
													className='p-1.5 rounded-lg transition-colors shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50'
												>
													<Trash2 size={14} />
												</button>
											</div>

											{/* Properties */}
											<div
												className='grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t'
												style={{ borderColor: 'var(--border)' }}
											>
												{d.accuracyClass && (
													<div className='min-w-0'>
														<p className='text-xs mb-0.5 truncate' style={{ color: 'var(--muted-foreground)' }}>
															{a.tableCols.accuracy}
														</p>
														<p className='text-xs font-semibold truncate' style={{ color: 'hsl(205 45% 25%)' }}>
															{d.accuracyClass}
														</p>
													</div>
												)}
												{d.measureRange && (
													<div className='min-w-0'>
														<p className='text-xs mb-0.5 truncate' style={{ color: 'var(--muted-foreground)' }}>
															{a.tableCols.range}
														</p>
														<p className='text-xs font-semibold truncate' style={{ color: 'hsl(25 80% 45%)' }}>
															{d.measureRange}
														</p>
													</div>
												)}
												{d.serialNumber && (
													<div className='min-w-0'>
														<p className='text-xs mb-0.5 truncate' style={{ color: 'var(--muted-foreground)' }}>
															{a.tableCols.serial}
														</p>
														<p className='text-xs font-semibold truncate' style={{ color: 'hsl(142 60% 28%)' }}>
															{d.serialNumber}
														</p>
													</div>
												)}
												<div className='min-w-0'>
													<p className='text-xs mb-0.5 truncate' style={{ color: 'var(--muted-foreground)' }}>
														{a.tableCols.verification}
													</p>
													<p className='text-xs font-semibold truncate' style={{ color: 'var(--foreground)' }}>
														{verificationLabel[d.verificationRange] ?? d.verificationRange}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							<Button
								variant='ghost'
								size='sm'
								icon={<Plus size={14} />}
								onClick={() => { setDeviceForm(emptyDeviceForm); setModalOpen(true); setErrors((p) => ({ ...p, devices: '' })); }}
							>
								{a.addDevice}
							</Button>
							{errors.devices && (
								<p className='text-xs text-red-500 mt-1'>{errors.devices}</p>
							)}
						</div>
					</div>

					{/* Footer */}
					<div
						className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 sm:px-8 py-5 border-t'
						style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}
					>
						{submitStatus === 'error' && (
							<p className='text-sm text-red-600 font-medium'>❌ {a.error}</p>
						)}
						{submitStatus === 'idle' && (
							<div className='flex items-center gap-2'>
								<input
									ref={fileInputRef}
									type='file'
									accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
									onChange={handleFileChange}
									className='hidden'
									id='app-file-input'
								/>
								<label
									htmlFor='app-file-input'
									className='flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors'
									style={{ color: 'hsl(205 45% 30%)' }}
								>
									<Upload size={15} />
									{attachedFile ? attachedFile.name : a.attachFile}
								</label>
								{attachedFile && (
									<button
										type='button'
										onClick={() => {
											setAttachedFile(null);
											if (fileInputRef.current) fileInputRef.current.value = '';
										}}
										className='text-xs text-red-400 hover:text-red-600'
									>
										✕
									</button>
								)}
							</div>
						)}
						<Button variant='primary' size='lg' disabled={submitting} onClick={handleSubmit} className='w-full sm:w-auto sm:ml-auto'>
							{submitting ? a.submitting : a.submit}
						</Button>
					</div>
				</div>
				)}

			{/* Device modal */}
			<Modal open={modalOpen} onClose={() => setModalOpen(false)} title={m.title}>
				<div className='space-y-5'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Input label={m.type} value={deviceForm.type} onChange={(e) => setField('type', e.target.value)} placeholder={m.typePlaceholder} />
						<Input label={m.measureRange} value={deviceForm.measureRange} onChange={(e) => setField('measureRange', e.target.value)} placeholder={m.measureRangePlaceholder} />
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Input label={m.accuracyClass} value={deviceForm.accuracyClass} onChange={(e) => setField('accuracyClass', e.target.value)} placeholder={m.accuracyPlaceholder} />
						<Select label={m.quantityType} options={quantityOptions} value={deviceForm.quantityType} onChange={(v) => setField('quantityType', v)} />
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Input
							label={deviceForm.quantityType === 'count' ? m.count : m.serialNumber}
							placeholder={deviceForm.quantityType === 'count' ? m.countPlaceholder : m.serialNumberPlaceholder}
							value={deviceForm.serialNumber}
							onChange={(e) => setField('serialNumber', e.target.value)}
						/>
						<Select label={m.verificationRange} options={verificationRangeOptions} value={deviceForm.verificationRange} onChange={(v) => setField('verificationRange', v)} />
					</div>

					{deviceForm.verificationRange === 'points' && (
						<div className='rounded-xl border p-4' style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
							<div className='flex items-center justify-between mb-3'>
								<span className='text-xs font-semibold' style={{ color: 'var(--muted-foreground)' }}>{m.checkPointsTitle}</span>
								<button type='button' onClick={addCheckPoint} className='flex items-center gap-1 text-xs font-medium' style={{ color: 'hsl(205 45% 25%)' }}>
									<Plus size={13} />{m.addCheckPoint}
								</button>
							</div>
							<div className='space-y-2'>
								{deviceForm.checkPoints.map((pt, i) => (
									<div key={i} className='grid grid-cols-[20px_1fr_1fr] gap-2 items-end'>
										<span className='text-xs font-medium text-right pb-2.5' style={{ color: 'var(--muted-foreground)' }}>{i + 1}.</span>
										<Input label={i === 0 ? m.checkValue : undefined} value={pt.value} onChange={(e) => updateCheckPoint(i, 'value', e.target.value)} placeholder='0.0' />
										<Input label={i === 0 ? m.checkUnit : undefined} value={pt.unit} onChange={(e) => updateCheckPoint(i, 'unit', e.target.value)} placeholder='°C' />
									</div>
								))}
							</div>
						</div>
					)}

					<div className='rounded-xl border p-4' style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
						<RadioGroup label={m.locationTitle} options={locationOptions} value={deviceForm.locationType} onChange={(v) => setField('locationType', v)} />
					</div>

					{deviceForm.locationType === 'onsite' && (
						<div className='space-y-3'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<Select
									label={m.region}
									options={regionOptions}
									value={deviceForm.regionId}
									onChange={(v) => setDeviceForm((p) => ({ ...p, regionId: v, districtId: '' }))}
									placeholder={m.regionPlaceholder}
								/>
								<Select
									label={m.district}
									options={districtOptions}
									value={deviceForm.districtId}
									onChange={(v) => setField('districtId', v)}
									placeholder={deviceForm.regionId ? m.districtPlaceholder : m.districtDisabled}
									disabled={!deviceForm.regionId}
								/>
							</div>
							<Input label={m.address} value={deviceForm.address} onChange={(e) => setField('address', e.target.value)} placeholder={m.addressPlaceholder} />
						</div>
					)}

					<div className='flex justify-end gap-2 pt-1'>
						<Button variant='ghost' onClick={() => setModalOpen(false)}>{m.cancel}</Button>
						<Button size='lg' onClick={saveDevice} disabled={!deviceForm.type}>{m.save}</Button>
					</div>
				</div>
			</Modal>
			</div>
		</section>
	);
}
