import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDashboardStats } from '../services/statsService';
import {
	LayoutDashboard,
	Mail,
	MapPin,
	ClipboardList,
	Award,
	Users,
	LogOut,
	Menu,
	X,
	Sun,
	Moon,
	ChevronDown,
	FileX,
} from 'lucide-react';
import { getRoles, hasRole, logout } from '../lib/auth';
import { useLang } from '../lib/LangContext';
import { useTheme } from '../lib/ThemeContext';
import type { Lang } from '../lib/i18n';

const LANG_FLAGS: Record<Lang, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
const LANGS: Lang[] = ['uz', 'ru', 'en'];

const APP_STATUSES = ['new', 'contract', 'acceptance', 'laboratory', 'completed', 'rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
	new: 'bg-blue-500',
	contract: 'bg-purple-500',
	acceptance: 'bg-amber-500',
	laboratory: 'bg-teal-500',
	completed: 'bg-green-500',
	rejected: 'bg-red-500',
};

const ACTIVE_CLS =
	'font-semibold bg-[hsl(205_45%_25%/0.09)] text-[hsl(205,45%,20%)] dark:bg-sky-400/10 dark:text-sky-300';
const IDLE_CLS =
	'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100';

export default function Layout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [open, setOpen] = useState(false);
	const [appsOpen, setAppsOpen] = useState(false);

	const { data: statsData } = useDashboardStats();
	const { perMonth: _pm, ...appCounts } = statsData?.applications ?? { perMonth: [] };
	const counts = appCounts as Record<string, number>;
	const { t, lang, setLang } = useLang();
	const { theme, toggle: toggleTheme } = useTheme();

	const user = localStorage.getItem('ecm_user') || 'Admin';
	const fullName = localStorage.getItem('ecm_fullName') || user;
	const roles = getRoles();
	const roleLabel = roles[0] ? (t.roles[roles[0] as keyof typeof t.roles] ?? roles[0]) : '';
	const initials =
		fullName
			.split(' ')
			.map((w: string) => w[0] || '')
			.join('')
			.slice(0, 2)
			.toUpperCase() || 'AD';

	// Role-based visibility
	const showDashboard = hasRole('admin', 'chief_laboratory');
	const showApplications = hasRole('admin', 'chief_laboratory', 'manager', 'buyro');
	const showCertificates = hasRole('admin', 'chief_laboratory', 'manager');
	const showContacts = hasRole('admin', 'chief_laboratory');
	const showRegions = hasRole('admin');
	const showUsers = hasRole('admin');
	const showRejections = hasRole('admin', 'chief_laboratory');

	const navItems = [
		{ to: '/certificates', icon: Award, label: t.nav.certificates, show: showCertificates },
		{ to: '/rejection-letters', icon: FileX, label: 'Bekor qilish xatlari', show: showRejections },
		{ to: '/contacts', icon: Mail, label: t.nav.contacts, show: showContacts },
		{ to: '/regions', icon: MapPin, label: t.nav.regions, show: showRegions },
		{ to: '/users', icon: Users, label: t.nav.users, show: showUsers },
	].filter((i) => i.show);

	/* auto-expand applications submenu */
	useEffect(() => {
		if (location.pathname.startsWith('/applications')) setAppsOpen(true);
	}, [location.pathname]);

	const onApps = location.pathname.startsWith('/applications');
	const activeStatus = onApps ? (new URLSearchParams(location.search).get('status') ?? '') : '';

	const pageTitle = (() => {
		if (location.pathname.startsWith('/applications')) {
			if (activeStatus) return t.status[activeStatus as keyof typeof t.status] ?? t.nav.applications;
			return t.nav.applications;
		}
		if (location.pathname.startsWith('/dashboard')) return t.nav.dashboard;
		return (
			navItems.find((n) => location.pathname.startsWith(n.to))?.label ??
			(location.pathname.startsWith('/blog') ? t.nav.blog : 'ECM Admin')
		);
	})();

	function handleLogout() {
		logout();
		navigate('/login');
	}

	return (
		<div className='flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden'>
			{/* Mobile backdrop */}
			{open && <div className='fixed inset-0 bg-black/40 z-40 lg:hidden' onClick={() => setOpen(false)} />}

			{/* ─── Sidebar ─── */}
			<aside
				className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-slate-800
        border-r border-gray-200 dark:border-slate-700
        flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
			>
				{/* Logo */}
				<div className='flex items-center gap-3 h-14 px-4 border-b border-gray-100 dark:border-slate-700 shrink-0'>
					<div
						className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0'
						style={{ background: 'hsl(205,45%,25%)' }}
					>
						<img src='/logo.png' alt='ECM' className='h-5 w-auto object-contain brightness-0 invert' />
					</div>
					<div className='min-w-0 flex-1'>
						<p className='text-sm font-bold text-gray-800 dark:text-slate-100 leading-tight'>
							{t.nav.brandName}
						</p>
						<p className='text-[11px] text-gray-400 dark:text-slate-500 leading-none mt-0.5'>
							{t.nav.adminPanel}
						</p>
					</div>
					<button
						onClick={() => setOpen(false)}
						className='lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors'
					>
						<X size={16} />
					</button>
				</div>

				{/* Nav */}
				<nav className='flex-1 px-3 py-4 overflow-y-auto'>
					<p className='px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest'>
						{t.nav.menu}
					</p>
					<div className='space-y-0.5'>
						{/* Dashboard — admin & chief_laboratory only */}
						{showDashboard && (
							<NavLink
								to='/dashboard'
								onClick={() => setOpen(false)}
								className={({ isActive }) =>
									`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? ACTIVE_CLS : IDLE_CLS}`
								}
							>
								<LayoutDashboard size={17} />
								{t.nav.dashboard}
							</NavLink>
						)}

						{/* Arizalar accordion — all roles */}
						{showApplications && (
							<div>
								<button
									onClick={() => {
										setAppsOpen((p) => !p);
										if (!onApps) navigate('/applications');
									}}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${onApps ? ACTIVE_CLS : IDLE_CLS}`}
								>
									<ClipboardList size={17} />
									<span className='flex-1 text-left'>{t.nav.applications}</span>
									{counts.total > 0 && (
										<span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white min-w-[18px] text-center'>
											{counts.total}
										</span>
									)}
									<ChevronDown
										size={13}
										className={`transition-transform duration-200 shrink-0 ${appsOpen ? 'rotate-180' : ''} opacity-50`}
									/>
								</button>

								{appsOpen && (
									<div className='mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 dark:border-slate-700 space-y-0.5'>
										{APP_STATUSES.map((status) => {
											const isActive = activeStatus === status;
											const label = t.status[status as keyof typeof t.status];
											const count = (counts[status] as number | undefined) ?? 0;
											return (
												<Link
													key={status}
													to={`/applications?status=${status}`}
													onClick={() => setOpen(false)}
													className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive ? ACTIVE_CLS : IDLE_CLS}`}
												>
													<span
														className={`w-1.5 h-1.5 rounded-full shrink-0 ${count > 0 ? STATUS_COLORS[status] : 'bg-gray-300 dark:bg-slate-600'}`}
													/>
													<span className='flex-1 truncate'>{label}</span>
													{count > 0 && (
														<span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white min-w-[18px] text-center'>
															{count}
														</span>
													)}
												</Link>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* Remaining nav items filtered by role */}
						{navItems.map(({ to, icon: Icon, label }) => (
							<NavLink
								key={to}
								to={to}
								onClick={() => setOpen(false)}
								className={({ isActive }) =>
									`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? ACTIVE_CLS : IDLE_CLS}`
								}
							>
								<Icon size={17} />
								{label}
							</NavLink>
						))}
					</div>
				</nav>

				{/* Lang switcher */}
				<div className='px-4 py-2 border-t border-gray-100 dark:border-slate-700'>
					<div className='flex gap-1'>
						{LANGS.map((l) => (
							<button
								key={l}
								onClick={() => setLang(l)}
								className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
									lang === l
										? 'text-white'
										: 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
								}`}
								style={lang === l ? { background: 'hsl(205,45%,25%)' } : {}}
								title={t.lang[l]}
							>
								{LANG_FLAGS[l]}
							</button>
						))}
					</div>
				</div>

				{/* User + Logout */}
				<div className='px-3 py-3 border-t border-gray-100 dark:border-slate-700 shrink-0'>
					<div className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group'>
						<div
							className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white'
							style={{ background: 'hsl(205,45%,25%)' }}
						>
							{initials}
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-semibold text-gray-800 dark:text-slate-100 truncate leading-tight'>
								{fullName}
							</p>
							{roleLabel && (
								<p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate'>{roleLabel}</p>
							)}
						</div>
						<button
							onClick={handleLogout}
							title={t.nav.logout}
							className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shrink-0'
						>
							<LogOut size={15} />
						</button>
					</div>
				</div>
			</aside>

			{/* ─── Main ─── */}
			<div className='flex flex-col flex-1 min-w-0'>
				<header className='h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 px-4 sm:px-6 shrink-0'>
					<button
						onClick={() => setOpen(true)}
						className='lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors'
					>
						<Menu size={20} />
					</button>

					<div className='flex items-center gap-2'>
						<span className='text-xs text-gray-400 dark:text-slate-500 hidden sm:block'>
							{t.nav.breadcrumb}
						</span>
						<span className='text-gray-300 dark:text-slate-600 hidden sm:block'>/</span>
						<h1 className='text-sm font-semibold text-gray-700 dark:text-slate-200'>{pageTitle}</h1>
					</div>

					<div className='flex-1' />

					<button
						onClick={toggleTheme}
						className='p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors'
						title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
					>
						{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
					</button>

					<div
						className='lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0'
						style={{ background: 'hsl(205,45%,25%)' }}
					>
						{initials}
					</div>
				</header>

				<main className='flex-1 overflow-auto'>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
