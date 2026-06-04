import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedUserId = localStorage.getItem('userId');

        // If we have a user object but no userId (old JWT session), clear everything
        if (savedUser && !savedUserId) {
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // clean up old JWT key too
            setLoading(false);
            return;
        }

        if (savedUser && savedUserId) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const data = await api.login(username, password);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const register = async (username, password) => {
        const data = await api.register(username, password);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // clean up any old JWT key
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
