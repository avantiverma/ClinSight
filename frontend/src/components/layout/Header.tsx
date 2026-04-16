import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header() {
    const location = useLocation();
    const isHome = location.pathname === '/';
    
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const headerClasses = isHome 
        ? "bg-[#FFFFFF] border-b border-[#E2E8F0] h-16 flex items-center justify-between px-8 z-40 relative shadow-none"
        : "bg-[#FFFFFF] border-b border-[#E2E8F0] h-16 flex items-center justify-between px-8 z-40 sticky top-0 shadow-none";

    return (
        <header className={headerClasses}>
            <div className="text-sm font-medium text-clinical-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-clinical-low animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                {today}
            </div>
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-[#94A3B8] hover:text-[#0F172A] transition-colors rounded-full hover:bg-[#FEF3C7] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#EF4444] border-2 border-white" />
                </button>
            </div>
        </header>
    );
}
