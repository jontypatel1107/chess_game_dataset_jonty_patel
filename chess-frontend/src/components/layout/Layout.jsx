import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        <Navbar />
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
