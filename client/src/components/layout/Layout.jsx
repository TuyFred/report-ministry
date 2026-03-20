import React, { useMemo, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const showSidebar = useMemo(() => {
        return true;
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {showSidebar && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Navbar toggleSidebar={toggleSidebar} showSidebarToggle={showSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0">
                    {children}
                </main>
            </div>
            {/* Overlay for mobile */}
            {showSidebar && sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
};

export default Layout;
