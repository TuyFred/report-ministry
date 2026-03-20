import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { FaBars, FaUserCircle, FaChurch, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, showSidebarToggle = true }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    return (
        <nav className="bg-white shadow-md h-16 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {showSidebarToggle && (
                    <button onClick={toggleSidebar} className="text-gray-600 hover:text-indigo-600 focus:outline-none lg:hidden">
                        <FaBars className="h-6 w-6" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <FaChurch className="text-indigo-600 text-2xl" />
                    <span className="text-xl font-bold text-gray-800">Ministry Reports</span>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm text-gray-500">Welcome back,</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.fullname}</p>
                </div>
                <div className="relative" ref={profileMenuRef}>
                    <button 
                        onClick={toggleProfileMenu}
                        className="flex items-center focus:outline-none"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm">
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
                                            parent.innerHTML = '<div class="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300"><svg class="h-full w-full" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                    <FaUserCircle className="h-full w-full" />
                                </div>
                            )}
                        </div>
                    </button>
                    
                    {/* Profile Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 transform origin-top-right transition-all ${showProfileMenu ? 'block' : 'hidden'}`}>
                        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    {user?.profile_image ? (
                                        <img 
                                            src={`${API_URL}/${user.profile_image}?t=${Date.now()}`}
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const parent = e.target?.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400"><svg class="text-3xl" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                                            <FaUserCircle className="text-3xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user?.fullname}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded capitalize">
                                    {user?.role}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                    {user?.country}
                                </span>
                            </div>
                        </div>
                        <div className="py-1">
                            <Link 
                                to="/settings" 
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                                <FaUserCircle />
                                My Profile
                            </Link>
                        </div>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                            <button 
                                onClick={onLogout} 
                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
