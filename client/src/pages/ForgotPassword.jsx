import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChurch, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setSuccess(true);
            setResetLink(res.data.resetLink);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                        <FaChurch className="text-indigo-600 text-4xl" />
                        <span className="text-3xl font-bold text-gray-800">Ministry Reports</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600">Enter your email to reset your password</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {success ? (
                        <div className="text-center">
                            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Link Sent!</h3>
                            <p className="text-gray-600 mb-4">
                                Check your email for the password reset link.
                            </p>
                            {resetLink && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Dev Mode - Reset Link:</p>
                                    <Link 
                                        to={`/reset-password/${resetLink.split('/').pop()}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 break-all"
                                    >
                                        Click here to reset password
                                    </Link>
                                </div>
                            )}
                            <Link 
                                to="/login" 
                                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaEnvelope className="inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg font-medium disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
