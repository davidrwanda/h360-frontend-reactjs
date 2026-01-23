import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useLogin } from '@/hooks/useAuth';
import { useSlots } from '@/hooks/useSlots';
import { format, parseISO } from 'date-fns';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Loading, Modal } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import { MdArrowBack, MdPerson, MdLogin, MdCalendarToday, MdAccessTime, MdLocalHospital, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const guestInfoSchema = z.object({
  guest_name: z.string().min(1, 'Full name is required'),
  guest_phone: z.string().min(1, 'Phone number is required'),
  guest_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type GuestInfoFormData = z.infer<typeof guestInfoSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export const BookAppointmentAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginMutation = useLogin({ skipNavigation: true });

  // Get slot and clinic info from URL params
  const slotId = searchParams.get('slot_id');
  const clinicId = searchParams.get('clinic_id');
  const slotDateParam = searchParams.get('slot_date');

  // Fetch slot details to display
  const { data: slotsData, isLoading: isLoadingSlot } = useSlots(
    slotId && clinicId && slotDateParam
      ? {
          clinic_id: clinicId,
          slot_date: slotDateParam,
          available_only: false,
          limit: 100,
        }
      : undefined
  );

  // Find the selected slot
  const selectedSlot = useMemo(() => {
    if (!slotId || !slotsData?.data) return null;
    return slotsData.data.find((slot) => slot.slot_id === slotId);
  }, [slotId, slotsData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    resolver: zodResolver(guestInfoSchema),
  });

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If user is already logged in, redirect to booking page immediately
  useEffect(() => {
    if (isAuthenticated && slotId && clinicId && slotDateParam) {
      navigate(`/book-appointment?clinic_id=${clinicId}&slot_id=${slotId}&slot_date=${slotDateParam}`, {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, clinicId, slotId, slotDateParam]);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSubmitForm = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await loginMutation.mutateAsync(data);
      setShowLoginModal(false);
      // Navigate to booking page after successful login
      setTimeout(() => {
        navigate(`/book-appointment?clinic_id=${clinicId}&slot_id=${slotId}&slot_date=${slotDateParam}`, {
          replace: true,
        });
      }, 200);
    } catch (err) {
      if (err instanceof Error) {
        setLoginError(err.message || 'Login failed. Please check your credentials.');
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleContinueAsGuest = (data: GuestInfoFormData) => {
    // Navigate to booking page with guest info in state
    navigate(`/book-appointment?clinic_id=${clinicId}&slot_id=${slotId}&slot_date=${slotDateParam}`, {
      state: { guestInfo: data },
      replace: true,
    });
  };

  // Show loading while checking authentication or loading slot
  if (isLoadingSlot || (isAuthenticated && slotId && clinicId && slotDateParam)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!selectedSlot || !clinicId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card variant="elevated">
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-medium text-smudged-lips mb-4">Slot Not Found</h2>
            <p className="text-carbon/60 mb-6">The selected slot is no longer available or invalid.</p>
            <Link to="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date and time for display
  const appointmentDate = parseISO(selectedSlot.slot_date);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = selectedSlot.formatted_time_slot;

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />
      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-carbon/60 hover:text-carbon transition-colors mb-4"
          >
            <MdArrowBack className="h-4 w-4" />
            Back to Search
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-2">Complete Your Booking</h1>
          <p className="text-sm text-carbon/60">
            Please login to track your appointment or continue as guest to complete your booking
          </p>
        </div>

        {/* Selected Slot Information */}
        <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdCalendarToday className="h-5 w-5 text-azure-dragon" />
            Selected Appointment Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <MdCalendarToday className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">Date</p>
                <p className="text-sm font-medium text-carbon">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdAccessTime className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">Time</p>
                <p className="text-sm font-medium text-carbon">{formattedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocalHospital className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">Clinic</p>
                <p className="text-sm font-medium text-carbon">{selectedSlot.clinic_name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login or Guest Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Login Option */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdLogin className="h-5 w-5 text-azure-dragon" />
              Login to Track Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/60 mb-4">
              Login to your account to track your appointment, view appointment history, and manage your health
              records.
            </p>
            <Button variant="primary" className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </CardContent>
        </Card>

        {/* Guest Option */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-5 w-5 text-azure-dragon" />
              Continue as Guest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleContinueAsGuest)} className="space-y-4">
              <p className="text-sm text-carbon/60 mb-4">
                Continue without logging in. You can register later to track your appointments.
              </p>
              <Input
                label="Full Name"
                placeholder="John Doe"
                {...register('guest_name')}
                error={errors.guest_name?.message}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1234567890"
                {...register('guest_phone')}
                error={errors.guest_phone?.message}
                required
              />
              <Input
                label="Email (Optional)"
                type="email"
                placeholder="john.doe@example.com"
                {...register('guest_email')}
                error={errors.guest_email?.message}
              />
              <Button type="submit" variant="outline" className="w-full">
                Continue as Guest
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login to Continue"
          size="sm"
        >
          <form onSubmit={handleLoginSubmit(handleLoginSubmitForm)} className="space-y-4">
            {loginError && (
              <div className="rounded-md bg-smudged-lips/8 border border-smudged-lips/25 px-3.5 py-2.5">
                <p className="text-xs text-smudged-lips font-ui leading-relaxed">{loginError}</p>
              </div>
            )}

            <div>
              <Input
                label="Username or Email"
                type="text"
                placeholder="Enter your username or email"
                error={loginErrors.username?.message}
                autoComplete="username"
                {...registerLogin('username')}
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                  {...registerLogin('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon/40 hover:text-carbon transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <MdVisibilityOff className="h-5 w-5" />
                  ) : (
                    <MdVisibility className="h-5 w-5" />
                  )}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1.5 text-xs text-smudged-lips font-ui">{loginErrors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              Sign In
            </Button>
          </form>
        </Modal>
      )}
      </div>
      <PublicFooter />
    </div>
  );
};
