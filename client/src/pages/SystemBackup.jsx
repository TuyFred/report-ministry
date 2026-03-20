import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaDatabase, FaDownload, FaHistory, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const SystemBackup = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [backupHistory, setBackupHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchBackupHistory();
    }, []);

    const fetchBackupHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/backup/history`, {
                headers: { 'x-auth-token': token }
            });
            setBackupHistory(response.data.backups || []);
        } catch (error) {
            console.error('Error fetching backup history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const createBackup = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/backup/create`,
                {},
                {
                    headers: { 'x-auth-token': token }
                }
            );

            setMessage({
                type: 'success',
                text: '✅ Backup created successfully! You can download it below.'
            });

            // Refresh backup history
            fetchBackupHistory();

            // Auto-download the backup
            if (response.data.downloadUrl) {
                window.location.href = `${API_URL}${response.data.downloadUrl}?token=${token}`;
            }

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error creating backup:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Failed to create backup'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadBackup = async (filename) => {
        try {
            const token = localStorage.getItem('token');
            window.location.href = `${API_URL}/api/backup/download/${filename}?token=${token}`;
        } catch (error) {
            console.error('Error downloading backup:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
                <div className="max-w-2xl mx-auto mt-20">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                        <p className="text-gray-600 mt-2">Only administrators can access system backup</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                            <FaDatabase className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">System Backup</h1>
                            <p className="text-gray-600 text-sm">Create and manage database backups</p>
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

                    {/* Create Backup Button */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Create New Backup</h2>
                        <p className="text-gray-600 mb-4 text-sm">
                            Create a complete SQL backup of the database including all users, reports, attachments, and form templates.
                        </p>
                        <button
                            onClick={createBackup}
                            disabled={loading}
                            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                                loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            <FaDatabase />
                            {loading ? 'Creating Backup...' : 'Create Backup Now'}
                        </button>
                    </div>

                    {/* Backup History */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaHistory className="text-gray-600 text-xl" />
                            <h2 className="text-xl font-bold text-gray-800">Backup History</h2>
                        </div>

                        {loadingHistory ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-gray-600 mt-4">Loading backup history...</p>
                            </div>
                        ) : backupHistory.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <FaDatabase className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No backups created yet</p>
                                <p className="text-gray-500 text-sm mt-2">Create your first backup to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date & Time</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Filename</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Size</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backupHistory.map((backup, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaClock className="text-blue-600" />
                                                        <span className="text-sm text-gray-700">
                                                            {formatDate(backup.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-mono text-gray-700">
                                                        {backup.filename}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {formatFileSize(backup.size)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                                        backup.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {backup.status === 'completed' ? (
                                                            <><FaCheckCircle /> Completed</>
                                                        ) : (
                                                            <><FaTimesCircle /> Failed</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => downloadBackup(backup.filename)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
                                                    >
                                                        <FaDownload />
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Information */}
                    <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        <h3 className="font-bold text-yellow-900 mb-3">⚠️ Important Backup Information</h3>
                        <ul className="space-y-2 text-sm text-yellow-800">
                            <li>• <strong>Regular Backups:</strong> Create backups before major updates or changes</li>
                            <li>• <strong>Storage:</strong> Backups are stored on the server and can be downloaded anytime</li>
                            <li>• <strong>Format:</strong> Downloads as a <strong>.sql</strong> file</li>
                            <li>• <strong>What's Included:</strong> Database (users, reports, attachments, report form templates)</li>
                            <li>• <strong>Security:</strong> Only administrators can create and download backups</li>
                            <li>• <strong>Restoration:</strong> Contact system administrator for backup restoration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemBackup;
