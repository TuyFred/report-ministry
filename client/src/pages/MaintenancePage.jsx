import React from 'react';
import { FaTools, FaExclamationTriangle } from 'react-icons/fa';

const MaintenancePage = () => {
    const handleRefresh = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Alert Banner */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-3 px-6 rounded-t-2xl shadow-lg">
                    <p className="font-bold text-lg flex items-center justify-center gap-2">
                        <FaExclamationTriangle className="animate-pulse" />
                        SYSTEM MAINTENANCE IN PROGRESS
                        <FaExclamationTriangle className="animate-pulse" />
                    </p>
                </div>

                <div className="bg-white rounded-b-2xl shadow-2xl p-8 md:p-12 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                            <FaTools className="text-white text-5xl animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            System Under Maintenance
                        </h1>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <p className="text-xl text-gray-700 font-semibold">
                                We're currently performing system maintenance
                            </p>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-8 border-2 border-orange-200">
                        <p className="text-gray-700 text-lg mb-4 font-medium">
                            🔧 Our team is working hard to improve your experience
                        </p>
                        <p className="text-gray-600 mb-3">
                            The system will be back online shortly. We apologize for any inconvenience this may cause.
                        </p>
                        <p className="text-orange-700 font-semibold">
                            ⚠️ Access is temporarily restricted to administrators only
                        </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            Estimated downtime: A few minutes
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Your data is safe and secure
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Please check back shortly
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="mt-6 px-8 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl font-bold text-lg hover:from-orange-700 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        🔄 Check Status & Retry
                    </button>

                    <p className="mt-6 text-xs text-gray-500">
                        If you are an administrator, please ensure you are logged in with admin credentials
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
