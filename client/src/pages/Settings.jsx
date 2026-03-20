import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaCheckCircle, FaCamera, FaUserPlus } from 'react-icons/fa';
import { API_URL } from '../utils/api';

const Settings = () => {
    const { user, updateUser, refreshUser } = useContext(AuthContext);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Add Admin State
    const [newAdminData, setNewAdminData] = useState({
        fullname: '',
        email: '',
        password: '',
        country: ''
    });
    const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
    const [adminLoading, setAdminLoading] = useState(false);


    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/users/profile-image`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Refresh user data from server to get the new profile image
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile image updated successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/auth/change-password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: { 'x-auth-token': token }
                }
            );

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Failed to change password'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setAdminMessage({ type: '', text: '' });
        setAdminLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/auth/create-admin`, newAdminData, {
                headers: { 'x-auth-token': token }
            });

            setAdminMessage({ type: 'success', text: 'New admin added successfully!' });
            setNewAdminData({ fullname: '', email: '', password: '', country: '' });
        } catch (error) {
            setAdminMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Failed to add admin'
            });
        } finally {
            setAdminLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                </div>

                {/* User Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaUser className="text-indigo-600" />
                        Account Information
                    </h2>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative group cursor-pointer">
                            <label className="block relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform transform group-hover:scale-105">
                                {user?.profile_image ? (
                                    <img 
                                        src={`${API_URL}/${user.profile_image}`}
                                        alt="Profile" 
                                        className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                                        key={user.id}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                
                                <div className={`w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-300 fallback-icon ${user?.profile_image ? 'hidden' : ''}`}>
                                    <FaUser className="text-6xl" />
                                </div>
                                
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                    <FaCamera className="text-white text-3xl opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all" />
                                </div>

                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>

                            {/* Edit Badge */}
                            <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white pointer-events-none">
                                <FaCamera className="text-sm" />
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h3 className="text-3xl font-bold text-gray-800">{user?.fullname}</h3>
                            <p className="text-gray-500 text-lg">{user?.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm">
                                    {user?.role}
                                </span>
                                <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-bold tracking-wide shadow-sm">
                                    {user?.country}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Full Name</p>
                            <p className="font-semibold text-gray-800">{user?.fullname}</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="font-semibold text-gray-800">{user?.email}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Role</p>
                            <p className="font-semibold text-gray-800 capitalize">{user?.role}</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Member Since</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(user?.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaLock className="text-indigo-600" />
                        Change Password
                    </h2>

                    {message.text && (
                        <div
                            className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border-2 border-green-200'
                                    : 'bg-red-50 text-red-800 border-2 border-red-200'
                            }`}
                        >
                            {message.type === 'success' && <FaCheckCircle className="text-green-600" />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                    }
                                    placeholder="Enter current password"
                                    required
                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                                    }
                                    placeholder="Enter new password"
                                    required
                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                    }
                                    placeholder="Confirm new password"
                                    required
                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-[1.02]'
                            }`}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Add Admin Section (only for admins) */}
                {user?.role === 'admin' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUserPlus className="text-indigo-600" />
                            Add New Admin
                        </h2>

                        {adminMessage.text && (
                            <div
                                className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                                    adminMessage.type === 'success'
                                        ? 'bg-green-50 text-green-800 border-2 border-green-200'
                                        : 'bg-red-50 text-red-800 border-2 border-red-200'
                                }`}
                            >
                                {adminMessage.type === 'success' && <FaCheckCircle className="text-green-600" />}
                                {adminMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={newAdminData.fullname}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, fullname: e.target.value })}
                                    placeholder="Enter full name"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newAdminData.email}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={newAdminData.password}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                    placeholder="Enter password"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    value={newAdminData.country}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, country: e.target.value })}
                                    placeholder="Enter country"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={adminLoading}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                                    adminLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-[1.02]'
                                }`}
                            >
                                {adminLoading ? 'Adding Admin...' : 'Add Admin'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Settings;
