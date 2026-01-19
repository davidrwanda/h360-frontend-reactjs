import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white-smoke">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-56">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />

      {/* Mobile menu (alternative to bottom nav) */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
    </div>
  );
};
