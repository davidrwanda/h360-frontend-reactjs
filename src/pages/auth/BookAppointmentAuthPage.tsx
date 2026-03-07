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
import { useTranslation, APPOINTMENT } from '@/i18n';

interface GuestInfoFormData {
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
}

interface LoginFormData {
  username: string;
  password: string;
}

export const BookAppointmentAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginMutation = useLogin({ skipNavigation: true });
  const { t } = useTranslation();

  const guestInfoSchema = useMemo(() => z.object({
    guest_name: z.string().min(1, t(APPOINTMENT.FULL_NAME_REQUIRED)),
    guest_phone: z.string().min(1, t(APPOINTMENT.PHONE_REQUIRED)),
    guest_email: z.string().email(t(APPOINTMENT.INVALID_EMAIL)).optional().or(z.literal('')),
  }), [t]);

  const loginSchema = useMemo(() => z.object({
    username: z.string().min(1, t(APPOINTMENT.USERNAME_REQUIRED)),
    password: z.string().min(1, t(APPOINTMENT.PASSWORD_REQUIRED)),
  }), [t]);

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
        setLoginError(err.message || t(APPOINTMENT.LOGIN_FAILED));
      } else {
        setLoginError(t(APPOINTMENT.UNEXPECTED_ERROR));
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
            <h2 className="text-lg font-medium text-smudged-lips mb-4">{t(APPOINTMENT.SLOT_NOT_FOUND)}</h2>
            <p className="text-carbon/60 mb-6">{t(APPOINTMENT.SLOT_NOT_FOUND_DESC)}</p>
            <Link to="/">
              <Button variant="primary">{t(APPOINTMENT.BACK_TO_HOME)}</Button>
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
            {t(APPOINTMENT.BACK_TO_SEARCH)}
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-2">{t(APPOINTMENT.COMPLETE_YOUR_BOOKING)}</h1>
          <p className="text-sm text-carbon/60">
            {t(APPOINTMENT.LOGIN_OR_GUEST_DESC)}
          </p>
        </div>

        {/* Selected Slot Information */}
        <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdCalendarToday className="h-5 w-5 text-azure-dragon" />
            {t(APPOINTMENT.SELECTED_APPOINTMENT_TIME)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <MdCalendarToday className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">{t(APPOINTMENT.DATE)}</p>
                <p className="text-sm font-medium text-carbon">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdAccessTime className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">{t(APPOINTMENT.TIME)}</p>
                <p className="text-sm font-medium text-carbon">{formattedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocalHospital className="h-5 w-5 text-azure-dragon/60" />
              <div>
                <p className="text-xs text-carbon/60 mb-1">{t(APPOINTMENT.CLINIC)}</p>
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
              {t(APPOINTMENT.LOGIN_TO_TRACK)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/60 mb-4">
              {t(APPOINTMENT.LOGIN_TO_TRACK_DESC)}
            </p>
            <Button variant="primary" className="w-full" onClick={handleLogin}>
              {t(APPOINTMENT.LOGIN)}
            </Button>
          </CardContent>
        </Card>

        {/* Guest Option */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-5 w-5 text-azure-dragon" />
              {t(APPOINTMENT.CONTINUE_AS_GUEST)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleContinueAsGuest)} className="space-y-4">
              <p className="text-sm text-carbon/60 mb-4">
                {t(APPOINTMENT.GUEST_DESC)}
              </p>
              <Input
                label={t(APPOINTMENT.FULL_NAME)}
                placeholder="John Doe"
                {...register('guest_name')}
                error={errors.guest_name?.message}
                required
              />
              <Input
                label={t(APPOINTMENT.PHONE_NUMBER)}
                type="tel"
                placeholder="+1234567890"
                {...register('guest_phone')}
                error={errors.guest_phone?.message}
                required
              />
              <Input
                label={t(APPOINTMENT.EMAIL_OPTIONAL)}
                type="email"
                placeholder="john.doe@example.com"
                {...register('guest_email')}
                error={errors.guest_email?.message}
              />
              <Button type="submit" variant="outline" className="w-full">
                {t(APPOINTMENT.CONTINUE_AS_GUEST)}
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
          title={t(APPOINTMENT.LOGIN_TO_CONTINUE)}
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
                label={t(APPOINTMENT.USERNAME_OR_EMAIL)}
                type="text"
                placeholder={t(APPOINTMENT.USERNAME_PLACEHOLDER)}
                error={loginErrors.username?.message}
                autoComplete="username"
                {...registerLogin('username')}
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                {t(APPOINTMENT.PASSWORD)}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t(APPOINTMENT.PASSWORD_PLACEHOLDER)}
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
              {t(APPOINTMENT.SIGN_IN)}
            </Button>
          </form>
        </Modal>
      )}
      </div>
      <PublicFooter />
    </div>
  );
};
