import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaPlus, FaUsers, FaChartBar, FaCog, FaChurch, FaEye, FaCalendarWeek, FaCalendarAlt, FaKey, FaTools, FaDatabase } from 'react-icons/fa';
import { API_URL } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt />, roles: ['admin', 'leader', 'member'] },
        { name: 'Submit Report', path: '/report-form', icon: <FaPlus />, roles: ['leader', 'member'] },
        { name: 'View My Reports', path: '/view-reports', icon: <FaEye />, roles: ['leader', 'member'] },
        { name: 'Weekly Report', path: '/weekly-report', icon: <FaCalendarWeek />, roles: ['member'] },
        { name: 'Monthly Report', path: '/monthly-report', icon: <FaCalendarAlt />, roles: ['member'] },
        { name: 'All Reports', path: '/reports', icon: <FaFileAlt />, roles: ['admin', 'leader'] },
        { name: 'Report Manager', path: '/report-manager', icon: <FaFileAlt />, roles: ['admin'] },
        { name: 'Members', path: '/members', icon: <FaUsers />, roles: ['admin', 'leader'] },
        { name: 'Analytics', path: '/analytics', icon: <FaChartBar />, roles: ['admin', 'leader'] },
        { name: 'Reset Password', path: '/reset-password-admin', icon: <FaKey />, roles: ['admin'] },
        { name: 'Maintenance Mode', path: '/maintenance-mode', icon: <FaTools />, roles: ['admin'] },
        { name: 'System Backup', path: '/system-backup', icon: <FaDatabase />, roles: ['admin'] },
        { name: 'Settings', path: '/settings', icon: <FaCog />, roles: ['admin', 'leader', 'member'] },
    ];

    const isActive = (path) => location.pathname === path;

    // Filter links based on user role
    const visibleLinks = links.filter(link => link.roles.includes(user?.role));

    return (
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-center h-14 bg-gray-900 border-b border-gray-700 flex-shrink-0">
                <FaChurch className="text-indigo-400 text-2xl mr-2" />
                <span className="text-2xl font-bold">MRS</span>
            </div>
            
            {/* User Info */}
            <div className="px-4 py-3 bg-gray-800 bg-opacity-50 border-b border-gray-700 flex items-center gap-3 flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600">
                    {user?.profile_image ? (
                        <img 
                            src={`${API_URL}/${user.profile_image}`}
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            key={user.id}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target?.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800"><svg class="text-lg" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg></div>';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                            <FaUsers className="text-lg" />
                        </div>
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Logged in as</p>
                    <p className="text-sm font-semibold truncate text-white">{user?.fullname}</p>
                    <p className="text-xs text-indigo-400 capitalize font-medium">{user?.role}</p>
                </div>
            </div>

            <nav className="flex-1 mt-3 px-3 overflow-hidden">
                {visibleLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-all ${
                            isActive(link.path) 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <span className={`mr-3 text-lg ${isActive(link.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                            {link.icon}
                        </span>
                        {link.name}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 bg-gray-900 border-t border-gray-700 flex-shrink-0">
                <p className="text-xs text-gray-500 text-center">Ministry Report System</p>
                <p className="text-xs text-gray-600 text-center mt-1">© 2025 All Rights Reserved</p>
            </div>
        </div>
    );
};

export default Sidebar;
