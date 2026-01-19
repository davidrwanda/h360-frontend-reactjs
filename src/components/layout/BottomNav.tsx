import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getFilteredNavigation } from '@/config/navigation';
import { cn } from '@/utils/cn';

/**
 * Bottom navigation bar for mobile devices
 * Shows primary navigation items at the bottom of the screen
 */
export const BottomNav = () => {
  const { user, role } = useAuth();
  const navigationItems = getFilteredNavigation(role, user?.user_type);
  
  // Show only first 5 items in bottom nav for mobile
  const bottomNavItems = navigationItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-carbon/10 bg-white shadow-lg md:hidden">
      <ul className="flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-2 py-2 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30',
                    isActive
                      ? 'text-azure-dragon'
                      : 'text-carbon/50 hover:text-azure-dragon'
                  )
                }
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
