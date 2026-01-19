import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getFilteredNavigation } from '@/config/navigation';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, role } = useAuth();
  const navigationItems = getFilteredNavigation(role, user?.user_type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-carbon/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl border-t border-carbon/10 bg-white shadow-2xl">
        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-carbon/10 pb-3">
            <h2 className="text-base font-heading font-semibold text-azure-dragon tracking-tight">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-carbon/60 transition-colors hover:bg-white-smoke"
              aria-label="Close menu"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-1">
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
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-ui transition-colors',
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
        </div>
      </div>
    </div>
  );
};
