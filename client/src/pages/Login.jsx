import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaChurch, FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({ 
        email: location.state?.email || '', 
        password: '' 
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    // Check maintenance mode on component mount - but don't block login form
    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.get(`${apiUrl}/api/auth/check`);
                setMaintenanceMode(false); // System is accessible
            } catch (err) {
                if (err.response?.status === 503 && err.response?.data?.maintenanceMode) {
                    setMaintenanceMode(true); // System in maintenance
                }
            }
        };
        checkMaintenance();
    }, []);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const onChange = e => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(email, password);
            // If login successful, navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 503 && err.response?.data?.maintenanceMode) {
                // Show error but don't redirect - admin might be trying to login
                setError('⚠️ System is under maintenance. Only administrators can access the system.');
            } else {
                setError(err.response?.data?.msg || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                        <FaChurch className="text-indigo-600 text-4xl" />
                        <span className="text-3xl font-bold text-gray-800">Ministry Reports</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up free
                        </Link>
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Maintenance Warning Banner */}
                    {maintenanceMode && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2">
                                <FaExclamationTriangle className="text-orange-600" />
                                System Under Maintenance
                            </div>
                            <p className="text-sm text-orange-700">
                                Access is restricted. Only administrators can log in during maintenance.
                            </p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            ✓ {successMessage}
                        </div>
                    )}
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaEnvelope className="inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    <FaLock className="inline mr-2" />
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSignInAlt />
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
