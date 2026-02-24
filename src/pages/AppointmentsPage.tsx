import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckIn } from '@/hooks/useQueue';
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';
import { CheckInModal } from '@/components/appointments/CheckInModal';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from '@/components/ui';
import { MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import { useTranslation, APPOINTMENT } from '@/i18n';
import type { Appointment } from '@/api/appointments';

export const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const clinicId = user?.clinic_id || user?.employee?.clinic_id || undefined;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [guestBookingFilter, setGuestBookingFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [checkInAppointment, setCheckInAppointment] = useState<Appointment | null>(null);
  const limit = 20;

  const checkInMutation = useCheckIn();

  const { data, isLoading, error } = useAppointments({
    page,
    limit,
    search: search || undefined,
    clinic_id: clinicId,
    status: statusFilter || undefined,
    appointment_date: dateFilter || undefined,
    is_guest_booking: guestBookingFilter === 'true' ? true : guestBookingFilter === 'false' ? false : undefined,
    sortBy: 'appointment_date',
    sortOrder: 'DESC',
  });

  const appointments = data?.data || [];
  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / limit);

  const hasActiveFilters = search || statusFilter || dateFilter || guestBookingFilter;

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFilter('');
    setGuestBookingFilter('');
    setPage(1);
  };

  const handleCheckInClick = (apt: Appointment) => {
    setSelectedAppointment(null);
    setCheckInAppointment(apt);
  };

  const handleCheckInConfirm = (appointmentId: string, options?: { doctor_id?: string; notes?: string }) => {
    checkInMutation.mutate(
      { appointmentId, options },
      { onSuccess: () => setCheckInAppointment(null) }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(APPOINTMENT.APPOINTMENTS_MANAGEMENT)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(APPOINTMENT.MANAGE_APPOINTMENTS)}
        </p>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-5 w-5" />
              {t(APPOINTMENT.FILTERS)}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? t(APPOINTMENT.HIDE_ADVANCED) : t(APPOINTMENT.SHOW_ADVANCED)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Input
                label={t(APPOINTMENT.SEARCH_APPOINTMENTS)}
                type="text"
                placeholder={t(APPOINTMENT.SEARCH_PLACEHOLDER)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>

            <Select
              label={t(APPOINTMENT.COLUMN_STATUS)}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: t(APPOINTMENT.ALL_STATUSES) },
                { value: 'booked', label: t(APPOINTMENT.STATUS_BOOKED) },
                { value: 'checked_in', label: t(APPOINTMENT.STATUS_CHECKED_IN) },
                { value: 'in_progress', label: t(APPOINTMENT.STATUS_IN_PROGRESS) },
                { value: 'completed', label: t(APPOINTMENT.STATUS_COMPLETED) },
                { value: 'cancelled', label: t(APPOINTMENT.STATUS_CANCELLED) },
                { value: 'no_show', label: t(APPOINTMENT.STATUS_NO_SHOW) },
              ]}
            />

            <Input
              label={t(APPOINTMENT.DATE_FILTER)}
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-carbon/10 mt-4">
              <Select
                label={t(APPOINTMENT.GUEST_BOOKING_FILTER)}
                value={guestBookingFilter}
                onChange={(e) => {
                  setGuestBookingFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: t(APPOINTMENT.ALL_BOOKINGS) },
                  { value: 'true', label: t(APPOINTMENT.GUEST_ONLY) },
                  { value: 'false', label: t(APPOINTMENT.REGISTERED_ONLY) },
                ]}
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                <MdClear className="h-4 w-4 mr-1" />
                {t(APPOINTMENT.CLEAR_FILTERS)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-smudged-lips">
                {t(APPOINTMENT.FAILED_TO_LOAD)}
              </p>
            </div>
          ) : (
            <>
              <AppointmentsTable
                appointments={appointments}
                isLoading={isLoading}
                onView={(apt) => setSelectedAppointment(apt)}
                onCheckIn={handleCheckInClick}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-carbon/10 px-4 py-3">
                  <p className="text-sm text-carbon/60">
                    {t(APPOINTMENT.PAGE_OF, { page, totalPages })} ({data?.total || 0} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t(APPOINTMENT.PREVIOUS)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t(APPOINTMENT.NEXT)}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCheckIn={handleCheckInClick}
        isCheckingIn={checkInMutation.isPending}
      />

      {/* Check-in Modal */}
      <CheckInModal
        appointment={checkInAppointment}
        isOpen={!!checkInAppointment}
        onClose={() => setCheckInAppointment(null)}
        onCheckIn={handleCheckInConfirm}
        isCheckingIn={checkInMutation.isPending}
        clinicId={clinicId}
      />
    </div>
  );
};
