import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
    name: string;
    email: string; // mapped from username
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    role: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Initialize state from local storage on load
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedRole) {
            setRole(storedRole);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await api.post('/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, role, name } = response.data;

        // Update State
        const userData = { email, role, name };
        setToken(access_token);
        setRole(role);
        setUser(userData);

        // Update Local Storage
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const register = async (name: string, email: string, password: string, role: string) => {
        await api.post('/auth/register', {
            name,
            email,
            password,
            role
        });

        // Auto-login after register? Or redirect to login? 
        // Requirements say: "On success: Store JWT... Redirect"
        // But backend register usually returns the user object, not token immediately unless designed so.
        // My backend implementation returns the User object.
        // So we need to log them in automatically or ask them to login.
        // Let's call login immediately to get the token.

        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        setToken(null);
        setRole(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role,
            isAuthenticated: !!token,
            login,
            register,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
