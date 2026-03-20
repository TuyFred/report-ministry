import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaTools, FaToggleOn, FaToggleOff, FaExclamationTriangle } from 'react-icons/fa';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const MaintenanceMode = () => {
    const { user } = useContext(AuthContext);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaintenanceStatus();
    }, []);

    const fetchMaintenanceStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/maintenance/status`, {
                headers: { 'x-auth-token': token }
            });
            setIsMaintenanceMode(response.data.isMaintenanceMode);
        } catch (error) {
            console.error('Error fetching maintenance status:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMaintenanceMode = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/maintenance/toggle`,
                {},
                {
                    headers: { 'x-auth-token': token }
                }
            );

            setIsMaintenanceMode(response.data.isMaintenanceMode);
            setMessage({
                type: 'success',
                text: response.data.isMaintenanceMode
                    ? '⚠️ Maintenance mode ENABLED - Users will see maintenance message'
                    : '✅ Maintenance mode DISABLED - System is now accessible'
            });

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Failed to toggle maintenance mode'
            });
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
                        <p className="text-gray-600 mt-2">Only administrators can access maintenance mode</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-yellow-600 flex items-center justify-center">
                            <FaTools className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Maintenance Mode</h1>
                            <p className="text-gray-600 text-sm">Control system accessibility during maintenance</p>
                        </div>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl ${
                            message.type === 'success'
                                ? 'bg-green-100 border-2 border-green-300 text-green-800'
                                : 'bg-red-100 border-2 border-red-300 text-red-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Current Status */}
                    <div className={`mb-8 p-6 rounded-2xl border-2 ${
                        isMaintenanceMode
                            ? 'bg-red-50 border-red-300'
                            : 'bg-green-50 border-green-300'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {isMaintenanceMode ? (
                                    <FaExclamationTriangle className="text-4xl text-red-600" />
                                ) : (
                                    <FaToggleOn className="text-4xl text-green-600" />
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {isMaintenanceMode ? 'System Under Maintenance' : 'System Active'}
                                    </h2>
                                    <p className={`text-sm mt-1 ${
                                        isMaintenanceMode ? 'text-red-700' : 'text-green-700'
                                    }`}>
                                        {isMaintenanceMode
                                            ? 'Users will see a maintenance message and cannot access the system'
                                            : 'All users can access the system normally'
                                        }
                                    </p>
                                </div>
                            </div>
                            {isMaintenanceMode ? (
                                <FaToggleOn className="text-5xl text-red-600" />
                            ) : (
                                <FaToggleOff className="text-5xl text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={toggleMaintenanceMode}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                            loading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isMaintenanceMode
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg'
                                    : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 shadow-lg'
                        }`}
                    >
                        {loading
                            ? 'Processing...'
                            : isMaintenanceMode
                                ? '✅ Turn OFF Maintenance Mode'
                                : '⚠️ Turn ON Maintenance Mode'
                        }
                    </button>

                    {/* Information */}
                    <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <h3 className="font-bold text-blue-900 mb-3">ℹ️ Important Information</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>• <strong>When ON:</strong> Users will see a maintenance message and cannot access the system</li>
                            <li>• <strong>When OFF:</strong> System operates normally for all users</li>
                            <li>• <strong>Admin Access:</strong> You can still access the system in maintenance mode</li>
                            <li>• <strong>Use Cases:</strong> Database updates, system upgrades, bug fixes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceMode;
