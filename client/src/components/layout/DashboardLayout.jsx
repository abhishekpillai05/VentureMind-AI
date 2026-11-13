import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="h-screen w-screen bg-[#F8FAFC] dark:bg-[#030712] flex flex-col text-[#172033] dark:text-slate-100 overflow-hidden relative transition-colors duration-200">
      {/* Dynamic ambient mesh gradients behind dashboard - only visible in dark mode */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10 dark:opacity-100 opacity-20" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[350px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10 dark:opacity-100 opacity-20" />
      <div className="fixed top-1/2 right-1/4 w-[400px] h-[300px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none -z-10 dark:opacity-100 opacity-10" />

      {/* Permanently Fixed Top Navigation Bar */}
      <Navbar />

      {/* Workspace Area: starts below the 64px fixed Navbar */}
      <div className="flex flex-1 pt-16 overflow-hidden h-full">
        {/* Permanently Fixed Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Application Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative z-10 h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
