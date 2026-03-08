import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useClinic,
  useUpdateClinic,
  useTimetableSlots,
  useInitializeTimetable,
  useAddTimetableSlot,
  useUpdateTimetableSlot,
  useDeleteTimetableSlot,
  useTenantInfo,
  useUpdateTenantSettings,
  useClinicFhirStatus,
  useValidateClinicFhir,
} from '@/hooks/useClinics';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useToastStore } from '@/store/toastStore';
import {
  Button,
  Card,
  CardContent,
  Input,
  Loading,
  DeleteConfirmationModal,
} from '@/components/ui';
import {
  MdArrowBack,
  MdEdit,
  MdSave,
  MdLocalHospital,
  MdSchedule,
  MdSettings,
  MdVerifiedUser,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdClose,
  MdError,
  MdRefresh,
  MdWarning,
  MdLocationOn,
  MdPhone,
  MdBusiness,
} from 'react-icons/md';
import { cn } from '@/utils/cn';
import type { UpdateClinicRequest, BookingMode, DayOfWeek, TimetableSlot, TimetableSlotInput, TimetableTime, TimetableScheduleDay } from '@/api/clinics';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTimetableTime(hhmm: string): TimetableTime {
  const [h, m] = hhmm.split(':').map(Number);
  const hours = h ?? 0;
  const minutes = m ?? 0;
  return { hours, minutes, time: hours * 60 + minutes };
}

function formatTime(t: TimetableTime): string {
  return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}`;
}

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const BOOKING_MODES: { value: BookingMode; label: string }[] = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'doctor_required', label: 'Doctor Required' },
  { value: 'service_required', label: 'Service Required' },
  { value: 'both_required', label: 'Both Required' },
  { value: 'time_slot_only', label: 'Time Slot Only' },
];

type Tab = 'profile' | 'timetable' | 'tenant' | 'fhir';

// ─── Profile Tab ──────────────────────────────────────────────────────────────

const ProfileTab = ({ clinicId }: { clinicId: string }) => {
  const { data: clinic, isLoading } = useClinic(clinicId);
  const { data: types = [] } = useClinicTypes({ include_inactive: false });
  const updateClinic = useUpdateClinic();
  const { success: showSuccess, error: showError } = useToastStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateClinicRequest>({});

  const startEditing = () => {
    if (!clinic) return;
    setForm({
      name: clinic.name,
      clinic_code: clinic.clinic_code,
      description: clinic.description,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      postal_code: clinic.postal_code,
      country: clinic.country,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      phone: clinic.phone,
      fax: clinic.fax,
      email: clinic.email,
      website: clinic.website,
      timezone: clinic.timezone,
      booking_mode: clinic.booking_mode,
      appointment_slot_duration: clinic.appointment_slot_duration,
      max_daily_appointments: clinic.max_daily_appointments,
      allow_online_booking: clinic.allow_online_booking,
      auto_assign_doctor: clinic.auto_assign_doctor,
      auto_check_in: clinic.auto_check_in,
      send_sms_reminders: clinic.send_sms_reminders,
      send_email_reminders: clinic.send_email_reminders,
      reminder_hours_before: clinic.reminder_hours_before,
      type_ids: clinic.type_ids,
      seo_slug: clinic.seo_slug,
      visibility: clinic.visibility,
      license_number: clinic.license_number,
      license_expiry_date: clinic.license_expiry_date,
      tax_id: clinic.tax_id,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateClinic.mutateAsync({ id: clinicId, data: form });
      showSuccess('Clinic profile updated');
      setEditing(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update clinic');
    }
  };

  const getTypeName = (type: (typeof types)[0]) => {
    const n = type.name;
    return typeof n === 'string' ? n : n.en;
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loading size="lg" /></div>;
  if (!clinic) return null;

  const completeness = clinic.profile_completeness ?? 0;

  return (
    <div className="space-y-6">
      {/* Profile completeness */}
      <div className="rounded-lg bg-azure-dragon/5 border border-azure-dragon/15 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-azure-dragon">Profile Completeness</span>
          <span className={cn('text-sm font-bold', completeness >= 70 ? 'text-azure-dragon' : 'text-amber-500')}>
            {completeness}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-azure-dragon/10">
          <div
            className={cn('h-2 rounded-full transition-all', completeness >= 70 ? 'bg-azure-dragon' : 'bg-amber-400')}
            style={{ width: `${completeness}%` }}
          />
        </div>
        {completeness < 70 && (
          <p className="text-xs text-amber-600 mt-1.5">
            Clinics need ≥70% to appear prominently in the directory.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <MdClose className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={updateClinic.isPending}>
              {updateClinic.isPending ? <Loading size="sm" /> : <><MdSave className="h-4 w-4 mr-1" />Save Changes</>}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <MdEdit className="h-4 w-4 mr-1" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        /* Edit form */
        <div className="space-y-6">
          {/* Basic */}
          <section>
            <h4 className="text-sm font-semibold text-carbon mb-3">Basic Info</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Clinic Name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <Input label="Clinic Code" value={form.clinic_code ?? ''} onChange={(e) => setForm({ ...form, clinic_code: e.target.value })} />
              <Input label="License Number" value={form.license_number ?? ''} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-carbon/80 mb-1.5">Description</label>
                <textarea
                  className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm text-carbon placeholder:text-carbon/35 focus:outline-none focus:ring-1 focus:ring-azure-dragon/30 focus:border-azure-dragon/60"
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h4 className="text-sm font-semibold text-carbon mb-3">Location & Contact</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Input label="City" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input label="Province" value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <Input label="Phone" type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Website" type="url" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </section>

          {/* Booking */}
          <section>
            <h4 className="text-sm font-semibold text-carbon mb-3">Booking</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-carbon/80 mb-1.5">Booking Mode</label>
                <select
                  className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 text-sm text-carbon focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                  value={form.booking_mode ?? 'flexible'}
                  onChange={(e) => setForm({ ...form, booking_mode: e.target.value as BookingMode })}
                >
                  {BOOKING_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Slot Duration (min)"
                type="number"
                value={String(form.appointment_slot_duration ?? '')}
                onChange={(e) => setForm({ ...form, appointment_slot_duration: parseInt(e.target.value) || undefined })}
              />
              <Input
                label="Max Daily Appointments"
                type="number"
                value={String(form.max_daily_appointments ?? '')}
                onChange={(e) => setForm({ ...form, max_daily_appointments: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div className="mt-3 space-y-2">
              {(
                [
                  ['allow_online_booking', 'Allow Online Booking'],
                  ['auto_assign_doctor', 'Auto-Assign Doctor'],
                  ['send_sms_reminders', 'SMS Reminders'],
                  ['send_email_reminders', 'Email Reminders'],
                ] as [keyof UpdateClinicRequest, string][]
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form[key] as boolean) ?? false}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-carbon/30 text-azure-dragon"
                  />
                  <span className="text-sm text-carbon/80">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Directory */}
          <section>
            <h4 className="text-sm font-semibold text-carbon mb-3">Directory & SEO</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SEO Slug" value={form.seo_slug ?? ''} onChange={(e) => setForm({ ...form, seo_slug: e.target.value })} placeholder="my-clinic-kigali" />
              <div>
                <label className="block text-xs font-medium text-carbon/80 mb-1.5">Visibility</label>
                <select
                  className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 text-sm text-carbon focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                  value={form.visibility ?? 'public'}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value as 'public' | 'unlisted' | 'private' })}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </section>

          {/* Clinic types */}
          {types.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-carbon mb-3">Clinic Types</h4>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => {
                  const selected = (form.type_ids ?? []).includes(type.clinic_type_id);
                  return (
                    <button
                      key={type.clinic_type_id}
                      type="button"
                      onClick={() => {
                        const ids = form.type_ids ?? [];
                        setForm({
                          ...form,
                          type_ids: selected ? ids.filter((id) => id !== type.clinic_type_id) : [...ids, type.clinic_type_id],
                        });
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                        selected
                          ? 'border-azure-dragon bg-azure-dragon/10 text-azure-dragon'
                          : 'border-carbon/15 text-carbon/60 hover:border-azure-dragon/40'
                      )}
                    >
                      {getTypeName(type)}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Read-only view */
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs text-carbon/50 mb-0.5">Name</p>
            <p className="text-sm font-medium text-carbon">{clinic.name}</p>
          </div>
          {clinic.clinic_code && (
            <div>
              <p className="text-xs text-carbon/50 mb-0.5">Code</p>
              <p className="text-sm font-mono text-carbon">{clinic.clinic_code}</p>
            </div>
          )}
          {clinic.city && (
            <div>
              <p className="text-xs text-carbon/50 mb-0.5">Location</p>
              <p className="text-sm text-carbon flex items-center gap-1">
                <MdLocationOn className="h-3.5 w-3.5 text-carbon/40" />
                {[clinic.city, clinic.state, clinic.country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          {clinic.phone && (
            <div>
              <p className="text-xs text-carbon/50 mb-0.5">Phone</p>
              <p className="text-sm text-carbon flex items-center gap-1">
                <MdPhone className="h-3.5 w-3.5 text-carbon/40" />
                {clinic.phone}
              </p>
            </div>
          )}
          {clinic.booking_mode && (
            <div>
              <p className="text-xs text-carbon/50 mb-0.5">Booking Mode</p>
              <p className="text-sm text-carbon capitalize">{clinic.booking_mode.replace(/_/g, ' ')}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-carbon/50 mb-0.5">Online Booking</p>
            <p className="text-sm text-carbon">{clinic.allow_online_booking ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="text-xs text-carbon/50 mb-0.5">Visibility</p>
            <p className="text-sm text-carbon capitalize">{clinic.visibility ?? 'public'}</p>
          </div>
          {clinic.license_number && (
            <div>
              <p className="text-xs text-carbon/50 mb-0.5">License</p>
              <p className="text-sm text-carbon">{clinic.license_number}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Reinitialize Panel ───────────────────────────────────────────────────────

type DayWindows = Record<DayOfWeek, { start: string; end: string; notes: string }[]>;

const emptyDayWindows = (): DayWindows => ({
  monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
});

const ReinitializePanel = ({
  clinicId,
  onClose,
}: {
  clinicId: string;
  onClose: () => void;
}) => {
  const initTimetable = useInitializeTimetable();
  const { success: showSuccess, error: showError } = useToastStore();
  const [windows, setWindows] = useState<DayWindows>(emptyDayWindows);

  const addWindow = (day: DayOfWeek) =>
    setWindows((prev) => ({ ...prev, [day]: [...prev[day], { start: '08:00', end: '12:00', notes: '' }] }));

  const removeWindow = (day: DayOfWeek, idx: number) =>
    setWindows((prev) => ({ ...prev, [day]: prev[day].filter((_, i) => i !== idx) }));

  const updateWindow = (day: DayOfWeek, idx: number, patch: Partial<{ start: string; end: string; notes: string }>) =>
    setWindows((prev) => ({
      ...prev,
      [day]: prev[day].map((w, i) => (i === idx ? { ...w, ...patch } : w)),
    }));

  const handleSubmit = async () => {
    const schedule: TimetableScheduleDay[] = DAYS
      .filter((day) => windows[day].length > 0)
      .map((day_of_week) => ({
        day_of_week,
        time_slots: windows[day_of_week].map((w) => ({
          start_time: w.start,
          end_time: w.end,
        })),
      }));
    try {
      await initTimetable.mutateAsync({ clinicId, data: { schedule, replace_existing: true, is_active: true } });
      showSuccess('Timetable reinitialized');
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reinitialize timetable');
    }
  };

  const totalWindows = DAYS.reduce((n, d) => n + windows[d].length, 0);

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-5 space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-2.5">
        <MdWarning className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Replace entire schedule</p>
          <p className="text-xs text-amber-600 mt-0.5">
            This will delete all existing time slots and replace them with the windows you define below.
            If you leave all days empty, the timetable will be cleared.
          </p>
        </div>
      </div>

      {/* Per-day builder */}
      <div className="space-y-2">
        {DAYS.map((day) => (
          <div key={day} className="rounded-md border border-carbon/10 bg-white p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-carbon capitalize">{day}</span>
              <button
                type="button"
                onClick={() => addWindow(day)}
                className="flex items-center gap-0.5 text-xs text-azure-dragon hover:text-azure-dragon/80 font-medium"
              >
                <MdAdd className="h-3.5 w-3.5" />
                Add window
              </button>
            </div>
            {windows[day].length === 0 && (
              <p className="text-xs text-carbon/35 italic">Closed / no windows</p>
            )}
            {windows[day].map((w, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-1.5">
                <input
                  type="time"
                  className="rounded-md border border-carbon/15 px-2 py-1 text-sm focus:outline-none focus:border-azure-dragon/60"
                  value={w.start}
                  onChange={(e) => updateWindow(day, idx, { start: e.target.value })}
                />
                <span className="text-xs text-carbon/40">to</span>
                <input
                  type="time"
                  className="rounded-md border border-carbon/15 px-2 py-1 text-sm focus:outline-none focus:border-azure-dragon/60"
                  value={w.end}
                  onChange={(e) => updateWindow(day, idx, { end: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 min-w-0 rounded-md border border-carbon/15 px-2 py-1 text-sm placeholder:text-carbon/35 focus:outline-none focus:border-azure-dragon/60"
                  placeholder="Notes (optional)"
                  value={w.notes}
                  onChange={(e) => updateWindow(day, idx, { notes: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeWindow(day, idx)}
                  className="p-1 rounded text-carbon/30 hover:text-smudged-lips"
                >
                  <MdDelete className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-carbon/50">
          {totalWindows === 0 ? 'No windows — timetable will be cleared' : `${totalWindows} window${totalWindows !== 1 ? 's' : ''} across all days`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={initTimetable.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={initTimetable.isPending}
            className="bg-amber-500 hover:bg-amber-600 border-amber-500"
          >
            {initTimetable.isPending ? <Loading size="sm" /> : <><MdRefresh className="h-4 w-4 mr-1" />Reinitialize</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Timetable Tab ────────────────────────────────────────────────────────────

const TimetableTab = ({ clinicId }: { clinicId: string }) => {
  const { data: slots = [], isLoading } = useTimetableSlots(clinicId);
  const addSlot = useAddTimetableSlot();
  const updateSlot = useUpdateTimetableSlot();
  const deleteSlot = useDeleteTimetableSlot();
  const { success: showSuccess, error: showError } = useToastStore();

  const [showReinit, setShowReinit] = useState(false);
  const [addingDay, setAddingDay] = useState<DayOfWeek | null>(null);
  const [newSlot, setNewSlot] = useState({ start: '08:00', end: '12:00', notes: '' });
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editForm, setEditForm] = useState({ start: '', end: '', notes: '' });
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  const slotsByDay = (day: DayOfWeek) => slots.filter((s) => s.day_of_week === day);

  const handleAdd = async () => {
    if (!addingDay) return;
    try {
      const data: TimetableSlotInput = {
        day_of_week: addingDay,
        start_time: toTimetableTime(newSlot.start),
        end_time: toTimetableTime(newSlot.end),
        notes: newSlot.notes || undefined,
      };
      await addSlot.mutateAsync({ clinicId, data });
      showSuccess('Time slot added');
      setAddingDay(null);
      setNewSlot({ start: '08:00', end: '12:00', notes: '' });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add slot');
    }
  };

  const startEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setEditForm({
      start: formatTime(slot.start_time),
      end: formatTime(slot.end_time),
      notes: slot.notes ?? '',
    });
  };

  const handleUpdate = async () => {
    if (!editingSlot) return;
    try {
      await updateSlot.mutateAsync({
        clinicId,
        slotId: editingSlot.timetable_id,
        data: {
          start_time: toTimetableTime(editForm.start),
          end_time: toTimetableTime(editForm.end),
          notes: editForm.notes || undefined,
        },
      });
      showSuccess('Slot updated');
      setEditingSlot(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update slot');
    }
  };

  const handleDelete = async () => {
    if (!slotToDelete) return;
    try {
      await deleteSlot.mutateAsync({ clinicId, slotId: slotToDelete.timetable_id });
      showSuccess('Slot removed');
      setSlotToDelete(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove slot');
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loading size="lg" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-carbon">Weekly Schedule</h4>
          <p className="text-xs text-carbon/50">Multiple windows per day are supported (e.g. 08–12 + 14–18)</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReinit((v) => !v)}
          className={cn('text-xs', showReinit && 'border-amber-400 text-amber-600 bg-amber-50')}
        >
          <MdRefresh className="h-3.5 w-3.5 mr-1" />
          Reinitialize
        </Button>
      </div>

      {showReinit && (
        <ReinitializePanel clinicId={clinicId} onClose={() => setShowReinit(false)} />
      )}

      {DAYS.map((day) => {
        const daySlots = slotsByDay(day);
        const isAddingThisDay = addingDay === day;
        return (
          <div key={day} className="rounded-lg border border-carbon/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-carbon capitalize">{day}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setAddingDay(isAddingThisDay ? null : day); }}
                className="h-7 text-xs"
              >
                <MdAdd className="h-3.5 w-3.5 mr-0.5" />
                Add window
              </Button>
            </div>

            {daySlots.length === 0 && !isAddingThisDay && (
              <p className="text-xs text-carbon/35 italic">No windows configured</p>
            )}

            {daySlots.map((slot) =>
              editingSlot?.timetable_id === slot.timetable_id ? (
                <div key={slot.timetable_id} className="flex items-center gap-2 mt-1.5">
                  <input type="time" className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm focus:outline-none focus:border-azure-dragon/60" value={editForm.start} onChange={(e) => setEditForm({ ...editForm, start: e.target.value })} />
                  <span className="text-xs text-carbon/40">to</span>
                  <input type="time" className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm focus:outline-none focus:border-azure-dragon/60" value={editForm.end} onChange={(e) => setEditForm({ ...editForm, end: e.target.value })} />
                  <input type="text" className="flex-1 rounded-md border border-carbon/15 px-2 py-1.5 text-sm placeholder:text-carbon/35 focus:outline-none focus:border-azure-dragon/60" placeholder="Notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                  <Button variant="primary" size="sm" onClick={handleUpdate} disabled={updateSlot.isPending} className="h-8">Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingSlot(null)} className="h-8">Cancel</Button>
                </div>
              ) : (
                <div key={slot.timetable_id} className="flex items-center gap-3 mt-1.5 group">
                  <span className="text-sm text-carbon font-mono">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </span>
                  {slot.notes && <span className="text-xs text-carbon/50">{slot.notes}</span>}
                  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(slot)} className="p-1 rounded text-carbon/40 hover:text-azure-dragon">
                      <MdEdit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setSlotToDelete(slot)} className="p-1 rounded text-carbon/40 hover:text-smudged-lips">
                      <MdDelete className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}

            {isAddingThisDay && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-carbon/5">
                <input type="time" className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm focus:outline-none focus:border-azure-dragon/60" value={newSlot.start} onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })} />
                <span className="text-xs text-carbon/40">to</span>
                <input type="time" className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm focus:outline-none focus:border-azure-dragon/60" value={newSlot.end} onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })} />
                <input type="text" className="flex-1 rounded-md border border-carbon/15 px-2 py-1.5 text-sm placeholder:text-carbon/35 focus:outline-none focus:border-azure-dragon/60" placeholder="Notes (optional)" value={newSlot.notes} onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })} />
                <Button variant="primary" size="sm" onClick={handleAdd} disabled={addSlot.isPending} className="h-8">
                  {addSlot.isPending ? <Loading size="sm" /> : 'Add'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAddingDay(null)} className="h-8">Cancel</Button>
              </div>
            )}
          </div>
        );
      })}

      {slotToDelete && (
        <DeleteConfirmationModal
          isOpen={!!slotToDelete}
          onClose={() => setSlotToDelete(null)}
          onConfirm={handleDelete}
          title="Remove Time Slot"
          message="This will remove the time window from the clinic schedule."
          itemName={`${slotToDelete.day_of_week} ${formatTime(slotToDelete.start_time)}–${formatTime(slotToDelete.end_time)}`}
          isLoading={deleteSlot.isPending}
          variant="delete"
        />
      )}
    </div>
  );
};

// ─── Tenant Tab ───────────────────────────────────────────────────────────────

const TenantTab = ({ clinicId }: { clinicId: string }) => {
  const { data: tenant, isLoading } = useTenantInfo(clinicId);
  const updateTenant = useUpdateTenantSettings();
  const { success: showSuccess, error: showError } = useToastStore();

  const [sharePatient, setSharePatient] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (tenant && !initialized) {
    setSharePatient(tenant.sharing_settings?.share_patient_data_within_org ?? false);
    setShareAnalytics(tenant.sharing_settings?.share_analytics_within_org ?? false);
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await updateTenant.mutateAsync({
        clinicId,
        data: {
          sharing_settings: {
            share_patient_data_within_org: sharePatient,
            share_analytics_within_org: shareAnalytics,
          },
        },
      });
      showSuccess('Tenant settings updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update tenant settings');
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loading size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Record counts */}
      {tenant && (
        <div>
          <h4 className="text-sm font-semibold text-carbon mb-3">Data Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(tenant.data_summary ?? {}).map(([key, count]) => (
              <div key={key} className="rounded-lg bg-carbon/5 p-3 text-center">
                <p className="text-2xl font-bold text-azure-dragon">{count as number}</p>
                <p className="text-xs text-carbon/50 capitalize mt-0.5">{key.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sharing settings */}
      <div>
        <h4 className="text-sm font-semibold text-carbon mb-1">Data Sharing Within Organization</h4>
        <p className="text-xs text-carbon/50 mb-4">
          Control whether this clinic shares data with other clinics in the same organization.
        </p>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sharePatient}
              onChange={(e) => setSharePatient(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-carbon/30 text-azure-dragon"
            />
            <div>
              <p className="text-sm font-medium text-carbon">Share Patient Data</p>
              <p className="text-xs text-carbon/50">
                Allow other clinics in the organization to view shared patient records.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shareAnalytics}
              onChange={(e) => setShareAnalytics(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-carbon/30 text-azure-dragon"
            />
            <div>
              <p className="text-sm font-medium text-carbon">Share Analytics</p>
              <p className="text-xs text-carbon/50">
                Include this clinic's statistics in organization-level reporting.
              </p>
            </div>
          </label>
        </div>
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={updateTenant.isPending}>
            {updateTenant.isPending ? <Loading size="sm" /> : <><MdSave className="h-4 w-4 mr-1" />Save Settings</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── FHIR Tab ─────────────────────────────────────────────────────────────────

const FhirTab = ({ clinicId }: { clinicId: string }) => {
  const { data: status, isLoading } = useClinicFhirStatus(clinicId);
  const validate = useValidateClinicFhir();
  const { success: showSuccess, error: showError } = useToastStore();

  const handleValidate = async () => {
    try {
      await validate.mutateAsync(clinicId);
      showSuccess('FHIR validation complete');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Validation failed');
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loading size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-carbon">FHIR R4 Compliance</h4>
          <p className="text-xs text-carbon/50">Organization resource validation status</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleValidate} disabled={validate.isPending}>
          {validate.isPending ? <Loading size="sm" /> : <><MdRefresh className="h-4 w-4 mr-1" />Re-validate</>}
        </Button>
      </div>

      {status ? (
        <>
          <div className={cn('flex items-center gap-3 rounded-lg p-4 border', status.fhir_validated ? 'bg-green-50 border-green-200' : 'bg-smudged-lips/5 border-smudged-lips/20')}>
            {status.fhir_validated ? (
              <MdCheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <MdError className="h-6 w-6 text-smudged-lips flex-shrink-0" />
            )}
            <div>
              <p className={cn('text-sm font-medium', status.fhir_validated ? 'text-green-700' : 'text-smudged-lips')}>
                {status.fhir_validated ? 'FHIR Compliant' : 'Validation Failed'}
              </p>
              {status.fhir_last_validated_at && (
                <p className="text-xs text-carbon/50">
                  Last validated: {new Date(status.fhir_last_validated_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {status.errors.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-smudged-lips mb-2">Errors</h5>
              <ul className="space-y-1">
                {status.errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-carbon/70">
                    <MdError className="h-3.5 w-3.5 text-smudged-lips flex-shrink-0 mt-0.5" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status.warnings.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-amber-600 mb-2">Warnings</h5>
              <ul className="space-y-1">
                {status.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-carbon/70">⚠ {w}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-carbon/10 p-6 text-center">
          <MdVerifiedUser className="h-10 w-10 text-carbon/20 mx-auto mb-3" />
          <p className="text-sm text-carbon/50">No validation data yet. Run a validation to check FHIR compliance.</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: MdBusiness },
  { id: 'timetable', label: 'Timetable', icon: MdSchedule },
  { id: 'tenant', label: 'Tenant', icon: MdSettings },
  { id: 'fhir', label: 'FHIR', icon: MdVerifiedUser },
];

export const OrgClinicDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: clinic, isLoading } = useClinic(id);
  const [tab, setTab] = useState<Tab>('profile');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-4xl text-center py-16">
        <MdLocalHospital className="h-14 w-14 text-carbon/15 mx-auto mb-4" />
        <p className="text-sm text-carbon/50">Clinic not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/my-organization/clinics')}>
          Back to Clinics
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <button
          onClick={() => navigate('/my-organization/clinics')}
          className="mt-0.5 rounded-md p-1.5 text-carbon/60 hover:bg-white-smoke hover:text-carbon transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-heading font-semibold text-azure-dragon truncate">
              {clinic.name}
            </h1>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                clinic.is_active ? 'bg-bright-halo/20 text-azure-dragon' : 'bg-carbon/10 text-carbon/50'
              )}
            >
              {clinic.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-carbon/50 mt-0.5">
            {[clinic.city, clinic.state, clinic.country].filter(Boolean).join(', ') || 'No location set'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-carbon/10">
        <div className="flex gap-1">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                tab === tabId
                  ? 'border-azure-dragon text-azure-dragon'
                  : 'border-transparent text-carbon/60 hover:text-carbon'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <Card variant="elevated">
        <CardContent className="p-6">
          {tab === 'profile' && <ProfileTab clinicId={clinic.clinic_id} />}
          {tab === 'timetable' && <TimetableTab clinicId={clinic.clinic_id} />}
          {tab === 'tenant' && <TenantTab clinicId={clinic.clinic_id} />}
          {tab === 'fhir' && <FhirTab clinicId={clinic.clinic_id} />}
        </CardContent>
      </Card>
    </div>
  );
};
