import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get(`${API_URL}/api/auth/me`);
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['x-auth-token'];
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user for maintenance check
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const register = async (formData) => {
        // Register user but don't auto-login
        // User will be redirected to login page to enter credentials
        await axios.post(`${API_URL}/api/auth/register`, formData);
        // Don't set token or user - let them login manually
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Clear user data
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser({ ...userData });
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${API_URL}/api/auth/me`);
                setUser(res.data);
            } catch (err) {
                console.error('Failed to refresh user:', err);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
