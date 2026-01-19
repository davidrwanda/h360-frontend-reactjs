import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getFilteredNavigation } from '@/config/navigation';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, role } = useAuth();
  const navigationItems = getFilteredNavigation(role, user?.user_type);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-carbon/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-56 transform border-r border-carbon/10 bg-white shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-14 items-center justify-between border-b border-carbon/10 px-4">
            <h2 className="text-sm font-heading font-semibold text-azure-dragon tracking-tight">
              H360 CRM
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-carbon/60 transition-colors hover:bg-white-smoke md:hidden"
              aria-label="Close menu"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <ul className="space-y-0.5">
              {navigationItems.map((item) => {
                // Handle dividers
                if (item.id.startsWith('divider')) {
                  return (
                    <li key={item.id} className="my-2">
                      <div className="h-px bg-carbon/10" />
                    </li>
                  );
                }

                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-ui transition-colors',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30',
                          isActive
                            ? 'bg-azure-dragon text-white shadow-sm'
                            : 'text-carbon/70 hover:bg-white-smoke hover:text-carbon'
                        )
                      }
                    >
                      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                      <span className="font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto rounded-full bg-smudged-lips px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-carbon/10 p-3">
            <div className="rounded-md bg-azure-dragon/5 p-2.5">
              <p className="text-xs font-medium text-azure-dragon mb-1">Current Role</p>
              <p className="text-sm capitalize text-carbon font-medium">
                {role || user?.user_type || 'N/A'}
              </p>
              {user?.permissions && (
                <p className="text-[10px] text-carbon/50 mt-0.5">
                  {user.permissions === 'ALL' ? 'Full Access' : user.permissions}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
