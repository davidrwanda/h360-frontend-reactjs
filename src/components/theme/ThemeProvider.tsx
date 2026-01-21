import { useEffect, useState } from 'react';
import { useMyPreferences } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';

type Theme = 'light' | 'dark' | 'system';

/**
 * ThemeProvider component that manages dark mode based on user preferences
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  // Only fetch preferences if user is logged in
  const { data: preferences, dataUpdatedAt } = useMyPreferences({ 
    enabled: isAuthenticated && !!user 
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    handleSystemThemeChange(mediaQuery);

    // Listen for system theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  // Apply theme based on user preference
  useEffect(() => {
    if (!user) {
      // If user is not logged in, use system preference
      const isDark = systemTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      return;
    }

    if (!preferences?.theme) {
      // If no preference is set, use system preference
      const isDark = systemTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      return;
    }

    const theme = preferences.theme.toLowerCase() as Theme;
    let isDark = false;

    if (theme === 'system') {
      isDark = systemTheme === 'dark';
    } else {
      isDark = theme === 'dark';
    }

    // Apply theme immediately
    document.documentElement.classList.toggle('dark', isDark);
    
    // Debug logging (remove in production if needed)
    if (import.meta.env.DEV) {
      console.log('Theme updated:', { theme, isDark, preferences, dataUpdatedAt });
    }
  }, [user, preferences, preferences?.theme, systemTheme, dataUpdatedAt]);

  return <>{children}</>;
};
