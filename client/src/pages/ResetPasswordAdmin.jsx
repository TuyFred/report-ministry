import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaKey, FaUser, FaSearch, FaLock } from 'react-icons/fa';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const ResetPasswordAdmin = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/users`, {
                    headers: { 'x-auth-token': token }
                });
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setMessage({ type: 'error', text: 'Failed to load users' });
            }
        };
        
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    // Filter users based on search
    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(u => 
                u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!selectedUser) {
            setMessage({ type: 'error', text: 'Please select a user' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/users/admin-reset-password`,
                {
                    userId: selectedUser.id,
                    newPassword: newPassword
                },
                {
                    headers: { 'x-auth-token': token }
                }
            );
            
            setMessage({ type: 'success', text: `Password reset successfully for ${selectedUser.fullname}` });
            setNewPassword('');
            setConfirmPassword('');
            setSelectedUser(null);
            setSearchTerm('');
            
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to reset password' });
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
                <div className="max-w-2xl mx-auto mt-20">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                        <p className="text-gray-600 mt-2">Only administrators can access this page</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                            <FaKey className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Reset User Password</h1>
                            <p className="text-gray-600 text-sm">Admin: Reset password for any user</p>
                        </div>
                    </div>

                    {/* Search Users */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaSearch className="inline mr-2" />
                            Search User
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Users List */}
                    {searchTerm && (
                        <div className="mb-6 max-h-64 overflow-y-auto no-scrollbar border-2 border-gray-200 rounded-xl">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setSearchTerm('');
                                        }}
                                        className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                {u.profile_image ? (
                                                    <img 
                                                        src={`${API_URL}/${u.profile_image}`} 
                                                        alt={u.fullname}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <FaUser className="text-indigo-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{u.fullname}</p>
                                                <p className="text-sm text-gray-600">{u.email}</p>
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-gray-500 text-center">No users found</p>
                            )}
                        </div>
                    )}

                    {/* Selected User */}
                    {selectedUser && (
                        <div className="mb-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                            <p className="text-sm text-indigo-700 font-semibold mb-2">Selected User:</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                    {selectedUser.profile_image ? (
                                        <img 
                                            src={`${API_URL}/${selectedUser.profile_image}`} 
                                            alt={selectedUser.fullname}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="text-indigo-600 text-xl" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{selectedUser.fullname}</p>
                                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-xl ${
                            message.type === 'success' 
                                ? 'bg-green-100 border-2 border-green-300 text-green-800' 
                                : 'bg-red-100 border-2 border-red-300 text-red-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Reset Password Form */}
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaLock className="inline mr-2" />
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 6 characters)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaLock className="inline mr-2" />
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedUser}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${
                                loading || !selectedUser
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                            }`}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordAdmin;
