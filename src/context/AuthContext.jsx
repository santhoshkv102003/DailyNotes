import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const USERS_KEY   = 'dn_users';
const SESSION_KEY = 'dn_session';

const getUsers  = () => JSON.parse(localStorage.getItem(USERS_KEY)  || '[]');
const saveUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
            try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    // currency is stored in the user object: { username, currency }
    const register = (username, password, currency = 'INR') => {
        const trimmed = username.trim();
        const users   = getUsers();

        if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
            throw new Error('Username already taken.');
        }

        const newUser = { username: trimmed, password, currency };
        saveUsers([...users, newUser]);

        // Auto-login immediately after registration
        const sessionUser = { username: trimmed, currency };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);
    };

    const login = (username, password) => {
        const users = getUsers();
        const found = users.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase()
              && u.password === password
        );
        if (!found) throw new Error('Invalid username or password.');

        const sessionUser = { username: found.username, currency: found.currency || 'INR' };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
