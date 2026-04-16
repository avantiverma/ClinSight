import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authBg from '../assets/auth-bg.jpg';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!role) {
            setError('Please select a role.');
            return;
        }

        try {
            await register(name, email, password, role);
            // Redirect based on role. 
            // Note: Login updates context asynchronously. 
            // Ideally we wait for context to reflect, but for now specific redirect is fine.
            if (role === 'admin') navigate('/dashboard/admin');
            else navigate('/dashboard/doctor');
        } catch (err: any) {
            console.error("Registration error:", err);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                // Handle FastAPI validation errors (array of objects)
                setError(detail.map((e: any) => e.msg).join(', '));
            } else if (typeof detail === 'object') {
                setError(JSON.stringify(detail));
            } else {
                setError('Registration failed. Please check your inputs.');
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
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">Request Access</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Join the ClinSight network
                    </p>
                </div>
                {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                id="full-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent transition-all sm:text-sm bg-white/50 focus:bg-white"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent transition-all sm:text-sm bg-white/50 focus:bg-white"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Clinical Role</label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent sm:text-sm bg-white/50 focus:bg-white text-slate-700"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-primary focus:border-transparent transition-all sm:text-sm bg-white/50 focus:bg-white"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-clinical-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-primary shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <UserPlus className="h-5 w-5 text-sky-200 group-hover:text-sky-100" aria-hidden="true" />
                            </span>
                            Register
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-clinical-primary hover:text-sky-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
