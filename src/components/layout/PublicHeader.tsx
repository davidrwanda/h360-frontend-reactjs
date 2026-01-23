import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { MdLocalHospital, MdMenu } from 'react-icons/md';

export const PublicHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  // Get user's full name and profile image
  const getUserName = () => {
    if (user?.patient?.full_name) return user.patient.full_name;
    if (user?.patient?.first_name && user?.patient?.last_name) {
      return `${user.patient.first_name} ${user.patient.last_name}`;
    }
    if (user?.employee?.full_name) return user.employee.full_name;
    if (user?.employee?.first_name && user?.employee?.last_name) {
      return `${user.employee.first_name} ${user.employee.last_name}`;
    }
    if (user?.full_name) return user.full_name;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.employee_profile?.full_name) return user.employee_profile.full_name;
    if (user?.employee_profile?.first_name && user?.employee_profile?.last_name) {
      return `${user.employee_profile.first_name} ${user.employee_profile.last_name}`;
    }
    return user?.username || user?.email || 'User';
  };

  const getUserInitials = () => {
    const name = getUserName();
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0]?.[0] || '';
      const last = parts[parts.length - 1]?.[0] || '';
      if (first && last) {
        return `${first}${last}`.toUpperCase();
      }
    }
    if (parts.length === 1 && parts[0] && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase() || 'U';
  };

  const getProfileImageUrl = (): string | null => {
    if (user?.employee?.profile_image_url) {
      return user.employee.profile_image_url;
    }
    if (user?.employee_profile?.profile_image_url) {
      return user.employee_profile.profile_image_url;
    }
    // Check if user has profile_image_url directly (for patients or other user types)
    const userWithImage = user as { profile_image_url?: string | null };
    if (userWithImage?.profile_image_url) {
      return userWithImage.profile_image_url;
    }
    return null;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-carbon/10 ${
        isLandingPage ? 'bg-white/95 backdrop-blur-sm' : 'bg-azure-dragon'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <MdLocalHospital className={`h-8 w-8 ${isLandingPage ? 'text-azure-dragon' : 'text-white'}`} />
            <div>
              <span className={`text-xl font-heading font-bold ${isLandingPage ? 'text-azure-dragon' : 'text-white'}`}>
                H360
              </span>
              <p className={`text-xs -mt-1 ${isLandingPage ? 'text-carbon/60' : 'text-white/80'}`}>
                Your healthcare appointment in one click
              </p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 rounded-full p-1.5 transition-colors ${
                    isLandingPage
                      ? 'hover:bg-carbon/5'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  aria-label="User menu"
                >
                  {getProfileImageUrl() ? (
                    <img
                      src={getProfileImageUrl()!}
                      alt={getUserName()}
                      className="h-8 w-8 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isLandingPage
                          ? 'bg-azure-dragon text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {getUserInitials()}
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-md border border-carbon/10 bg-white shadow-xl">
                      <div className="p-1.5">
                        <div className="border-b border-carbon/8 px-3 py-2.5">
                          <p className="text-sm font-medium text-carbon">{getUserName()}</p>
                          <p className="text-xs text-carbon/60 mt-0.5">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard');
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-carbon/80 transition-colors hover:bg-white-smoke"
                        >
                          Dashboard
                        </button>
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
                          onClick={handleLogout}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-smudged-lips transition-colors hover:bg-white-smoke"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isLandingPage ? 'text-carbon hover:text-azure-dragon' : 'text-white hover:bg-white/10'}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant={isLandingPage ? 'primary' : 'outline'}
                    size="sm"
                    className={!isLandingPage ? 'border-white text-white hover:bg-white hover:text-azure-dragon' : ''}
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`md:hidden ${isLandingPage ? 'text-carbon hover:text-azure-dragon' : 'text-white hover:text-white/80'}`}
          >
            <MdMenu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-carbon/10">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-b border-carbon/10">
                    <p className="text-sm font-medium text-carbon">{getUserName()}</p>
                    <p className="text-xs text-carbon/60 mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigate('/dashboard');
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-carbon/80 transition-colors hover:bg-white-smoke"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-carbon/80 transition-colors hover:bg-white-smoke"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-smudged-lips transition-colors hover:bg-white-smoke"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setShowMobileMenu(false)}>
                    <Button variant={isLandingPage ? 'primary' : 'outline'} size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
