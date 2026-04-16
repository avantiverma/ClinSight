import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Activity className="h-8 w-8 text-clinical-primary" />
                            <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">ClinSight</span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register" isPrimary>Get Started</NavLink>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-clinical-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <MobileNavLink to="/">Home</MobileNavLink>
                        <MobileNavLink to="/about">About</MobileNavLink>
                        <MobileNavLink to="/login">Login</MobileNavLink>
                        <MobileNavLink to="/register">Get Started</MobileNavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ to, children, isPrimary = false }: { to: string; children: React.ReactNode; isPrimary?: boolean }) => {
    if (isPrimary) {
        return (
            <Link
                to={to}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-clinical-primary hover:bg-sky-600 self-center transition-colors duration-150"
            >
                {children}
            </Link>
        );
    }
    return (
        <Link
            to={to}
            className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors duration-150"
        >
            {children}
        </Link>
    );
};

const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
    >
        {children}
    </Link>
);

export default Navbar;
