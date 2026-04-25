import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, UserPlus, ClipboardList, Bell, Settings, LogOut, Home, Info, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();

    const doctorLinks = [
        { name: 'Dashboard', href: '/dashboard/doctor', icon: LayoutDashboard },
        { name: 'New Patient', href: '/patients/new', icon: UserPlus },
        { name: 'Patient History', href: '/patients/history', icon: ClipboardList },
        { name: 'Alerts', href: '/alerts', icon: Bell },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const publicLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About', href: '/about', icon: Info },
        { name: 'Login', href: '/login', icon: LogIn },
        { name: 'Get Started', href: '/register', icon: UserPlus },
    ];

    const links = isAuthenticated ? doctorLinks : publicLinks;

    // A helper to safely display doctor name
    const displayName = user?.name ? (user.name.toLowerCase().includes('dr') ? user.name : `Dr. ${user.name.split(' ')[0]}`) : 'Dr. Avanti Verma';

    return (
        <div className="w-[220px] bg-gradient-to-b from-white to-[#F0F7FF] border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
                <Link to="/" className="flex items-center gap-2 group">
                    <Activity className="h-7 w-7 text-clinical-primary transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold text-clinical-text tracking-tight">ClinSight</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href) && link.href !== '#');
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1 ${isActive
                                ? 'bg-[#EFF6FF] text-clinical-text border-l-[3px] border-[#0EA5E9] shadow-sm'
                                : 'text-clinical-muted hover:bg-white/50 hover:text-clinical-text border-l-[3px] border-transparent'
                                }`}
                        >
                            <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#0EA5E9]' : 'text-[#94A3B8] group-hover:text-[#0EA5E9]'
                                }`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile */}
            {isAuthenticated && user && (
                <div className="shrink-0 mt-auto">
                    <div className="h-px bg-gray-200/60 mx-4 my-2"></div>
                    <div className="p-4 bg-transparent">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#0D9488] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-clinical-text truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-clinical-muted truncate">
                                    {user.role === 'admin' ? 'Administrator' : 'Physician'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-clinical-muted hover:text-clinical-high hover:bg-clinical-high-bg rounded-md transition-colors border border-transparent hover:border-red-100"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
