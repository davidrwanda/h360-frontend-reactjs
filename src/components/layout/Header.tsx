import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { MdMenu, MdNotifications, MdAccountCircle } from 'react-icons/md';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-carbon/10 bg-white px-4 shadow-sm md:px-6">
      {/* Left: Menu button and logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-md text-azure-dragon transition-colors hover:bg-white-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 md:hidden"
          aria-label="Toggle menu"
        >
          <MdMenu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-heading font-semibold text-azure-dragon tracking-tight">
            H360 Clinic CRM
          </h1>
        </div>
      </div>

      {/* Right: Notifications and user menu */}
      <div className="flex items-center gap-2">
        {/* Notifications - Future implementation */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-carbon/70 transition-colors hover:bg-white-smoke hover:text-azure-dragon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30"
          aria-label="Notifications"
        >
          <MdNotifications className="h-5 w-5" />
          {/* Badge can be added here */}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-carbon/80 transition-colors hover:bg-white-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30"
            aria-label="User menu"
          >
            <MdAccountCircle className="h-5 w-5 text-azure-dragon" />
            <span className="hidden font-medium md:block text-xs">{user?.username || 'User'}</span>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-md border border-carbon/10 bg-white shadow-xl">
                <div className="p-1.5">
                  <div className="border-b border-carbon/8 px-3 py-2.5">
                    <p className="text-sm font-medium text-carbon">{user?.username || user?.email}</p>
                    <p className="text-xs text-carbon/60 mt-0.5">{user?.email}</p>
                    <p className="mt-1.5 text-[11px] text-carbon/50 capitalize font-medium">
                      {user?.role || user?.user_type || 'N/A'}
                    </p>
                    {user?.permissions && (
                      <p className="mt-0.5 text-[10px] text-carbon/40">
                        {user.permissions === 'ALL' ? 'Full Access' : user.permissions}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-carbon/80 transition-colors hover:bg-white-smoke"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-smudged-lips transition-colors hover:bg-white-smoke"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
