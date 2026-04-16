import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authBg from '../assets/auth-bg.jpg';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            // Redirect is handled in AuthContext or component after login?
            // AuthContext updates state, but redirection depends on role.
            // Let's do redirection here based on role stored in localStorage available immediately after login? 
            // Better to pull role from the login response if possible, but login function returns void.
            // I'll grab it from localStorage or wait for context update. 
            // Simplest: Check localStorage which is synchronous.
            const role = localStorage.getItem('role');
            if (role === 'admin') navigate('/dashboard/admin');
            else navigate('/dashboard/doctor');
        } catch (err: any) {
            console.error("Login error:", err);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(detail.map((e: any) => e.msg).join(', '));
            } else {
                setError('Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Image - Clear & Visible */}
            <div className="absolute inset-0 z-0">
                <img
                    src={authBg}
                    alt="Medical Background"
                    className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay instead of blur - adds depth without hiding the image */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-clinical-primary/30 mix-blend-multiply"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl relative z-10 border border-white/50 transition-all hover:shadow-sky-500/20">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">Welcome Back</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Sign in to access your dashboard
                    </p>
                </div>
                {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent transition-all sm:text-sm bg-white/50 focus:bg-white"
                                placeholder="you@hospital.org"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent transition-all sm:text-sm bg-white/50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-clinical-primary focus:ring-clinical-primary border-slate-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-clinical-primary hover:text-sky-500 transition-colors">Forgot password?</a>
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-clinical-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-primary shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LogIn className="h-5 w-5 text-sky-200 group-hover:text-sky-100" aria-hidden="true" />
                            </span>
                            Sign in
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-clinical-primary hover:text-sky-500 transition-colors">
                            Request access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
