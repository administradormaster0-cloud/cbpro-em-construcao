import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#2A3555] flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};