import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCreateClinic, useInitializeTimetable } from '@/hooks/useClinics';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useToastStore } from '@/store/toastStore';
import { Button, Card, CardContent, Input, Loading } from '@/components/ui';
import {
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdLocalHospital,
  MdLocationOn,
  MdSettings,
  MdSchedule,
  MdPerson,
  MdAdd,
  MdDelete,
} from 'react-icons/md';
import { cn } from '@/utils/cn';
import type { CreateClinicRequest, BookingMode, DayOfWeek } from '@/api/clinics';

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: MdLocalHospital },
  { id: 'location', label: 'Location & Contact', icon: MdLocationOn },
  { id: 'booking', label: 'Booking Config', icon: MdSettings },
  { id: 'timetable', label: 'Timetable', icon: MdSchedule },
  { id: 'admin', label: 'Admin Setup', icon: MdPerson },
] as const;

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ current, done }: { current: number; done: number[] }) => (
  <div className="flex items-center justify-center mb-8 gap-1">
    {STEPS.map((step, i) => {
      const isDone = done.includes(i);
      const isActive = i === current;
      const Icon = step.icon;
      return (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                isDone
                  ? 'border-green-500 bg-green-500 text-white'
                  : isActive
                  ? 'border-azure-dragon bg-azure-dragon text-white'
                  : 'border-carbon/20 bg-white text-carbon/40'
              )}
            >
              {isDone ? <MdCheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
            </div>
            <span
              className={cn(
                'text-xs font-medium hidden sm:block',
                isActive ? 'text-azure-dragon' : isDone ? 'text-green-600' : 'text-carbon/40'
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 w-8 sm:w-10 mb-4',
                isDone || i < current ? 'bg-green-500' : 'bg-carbon/15'
              )}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

interface BasicData {
  name: string;
  clinic_code: string;
  description: string;
  type_ids: string[];
  established_date: string;
  license_number: string;
}

const BasicInfoStep = ({
  data,
  onChange,
}: {
  data: BasicData;
  onChange: (d: BasicData) => void;
}) => {
  const { data: types = [] } = useClinicTypes({ include_inactive: false });

  const toggleType = (id: string) => {
    const ids = data.type_ids.includes(id)
      ? data.type_ids.filter((t) => t !== id)
      : [...data.type_ids, id];
    onChange({ ...data, type_ids: ids });
  };

  const getTypeName = (type: (typeof types)[0]) => {
    const n = type.name;
    return typeof n === 'string' ? n : n.en;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-azure-dragon">Clinic Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Clinic Name *"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g. Kigali Health Center"
            required
          />
        </div>
        <Input
          label="Clinic Code"
          value={data.clinic_code}
          onChange={(e) => onChange({ ...data, clinic_code: e.target.value })}
          placeholder="e.g. KHC-001"
        />
        <Input
          label="License Number"
          value={data.license_number}
          onChange={(e) => onChange({ ...data, license_number: e.target.value })}
          placeholder="Ministry license #"
        />
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-carbon/80 mb-1.5">Description</label>
          <textarea
            className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm text-carbon placeholder:text-carbon/35 focus:outline-none focus:ring-1 focus:ring-azure-dragon/30 focus:border-azure-dragon/60"
            rows={3}
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Brief description of the clinic and services offered"
          />
        </div>
        <Input
          label="Established Date"
          type="date"
          value={data.established_date}
          onChange={(e) => onChange({ ...data, established_date: e.target.value })}
        />
      </div>

      {types.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-carbon/80 mb-2">Clinic Types</label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type.clinic_type_id}
                type="button"
                onClick={() => toggleType(type.clinic_type_id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  data.type_ids.includes(type.clinic_type_id)
                    ? 'border-azure-dragon bg-azure-dragon/10 text-azure-dragon'
                    : 'border-carbon/15 bg-white text-carbon/60 hover:border-azure-dragon/40'
                )}
              >
                {type.icon && <span>{type.icon}</span>}
                {getTypeName(type)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Location & Contact ───────────────────────────────────────────────

interface LocationData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  timezone: string;
}

const LocationStep = ({
  data,
  onChange,
}: {
  data: LocationData;
  onChange: (d: LocationData) => void;
}) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold text-azure-dragon">Location & Contact</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Street Address"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="KG 7 Ave, Kicukiro"
        />
      </div>
      <Input
        label="City"
        value={data.city}
        onChange={(e) => onChange({ ...data, city: e.target.value })}
        placeholder="Kigali"
      />
      <Input
        label="Province / State"
        value={data.state}
        onChange={(e) => onChange({ ...data, state: e.target.value })}
        placeholder="Kigali City"
      />
      <Input
        label="Postal Code"
        value={data.postal_code}
        onChange={(e) => onChange({ ...data, postal_code: e.target.value })}
        placeholder="00000"
      />
      <Input
        label="Country"
        value={data.country}
        onChange={(e) => onChange({ ...data, country: e.target.value })}
        placeholder="Rwanda"
      />
      <Input
        label="Latitude"
        type="number"
        value={data.latitude}
        onChange={(e) => onChange({ ...data, latitude: e.target.value })}
        placeholder="-1.9441"
      />
      <Input
        label="Longitude"
        type="number"
        value={data.longitude}
        onChange={(e) => onChange({ ...data, longitude: e.target.value })}
        placeholder="30.0619"
      />
      <Input
        label="Phone *"
        type="tel"
        value={data.phone}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        placeholder="+250 7XX XXX XXX"
        required
      />
      <Input
        label="Fax"
        type="tel"
        value={data.fax}
        onChange={(e) => onChange({ ...data, fax: e.target.value })}
        placeholder="+250 7XX XXX XXX"
      />
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        placeholder="clinic@example.com"
      />
      <Input
        label="Website"
        type="url"
        value={data.website}
        onChange={(e) => onChange({ ...data, website: e.target.value })}
        placeholder="https://clinic.rw"
      />
      <div>
        <label className="block text-xs font-medium text-carbon/80 mb-1.5">Timezone</label>
        <select
          className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm text-carbon focus:outline-none focus:ring-1 focus:ring-azure-dragon/30 focus:border-azure-dragon/60"
          value={data.timezone}
          onChange={(e) => onChange({ ...data, timezone: e.target.value })}
        >
          <option value="Africa/Kigali">Africa/Kigali (CAT, UTC+2)</option>
          <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
          <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
    </div>
  </div>
);

// ─── Step 3: Booking Config ───────────────────────────────────────────────────

interface BookingData {
  booking_mode: BookingMode;
  appointment_slot_duration: string;
  max_daily_appointments: string;
  allow_online_booking: boolean;
  auto_assign_doctor: boolean;
  auto_check_in: boolean;
  send_sms_reminders: boolean;
  send_email_reminders: boolean;
  reminder_hours_before: string;
}

const BOOKING_MODES: { value: BookingMode; label: string; desc: string }[] = [
  { value: 'flexible', label: 'Flexible', desc: 'Patient picks any available slot' },
  { value: 'doctor_required', label: 'Doctor Required', desc: 'Patient must choose a doctor' },
  { value: 'service_required', label: 'Service Required', desc: 'Patient must choose a service' },
  { value: 'both_required', label: 'Both Required', desc: 'Doctor + service required' },
  { value: 'time_slot_only', label: 'Time Slot Only', desc: 'Patient picks a time window only' },
];

const BookingStep = ({
  data,
  onChange,
}: {
  data: BookingData;
  onChange: (d: BookingData) => void;
}) => (
  <div className="space-y-5">
    <h3 className="text-base font-semibold text-azure-dragon">Booking Configuration</h3>

    <div>
      <label className="block text-xs font-medium text-carbon/80 mb-2">Booking Mode</label>
      <div className="grid gap-2 sm:grid-cols-2">
        {BOOKING_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange({ ...data, booking_mode: m.value })}
            className={cn(
              'flex flex-col items-start gap-0.5 rounded-lg border-2 px-4 py-3 text-left transition-all',
              data.booking_mode === m.value
                ? 'border-azure-dragon bg-azure-dragon/5'
                : 'border-carbon/10 hover:border-azure-dragon/30'
            )}
          >
            <span className="text-sm font-medium text-carbon">{m.label}</span>
            <span className="text-xs text-carbon/50">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Slot Duration (minutes)"
        type="number"
        value={data.appointment_slot_duration}
        onChange={(e) => onChange({ ...data, appointment_slot_duration: e.target.value })}
        placeholder="30"
      />
      <Input
        label="Max Daily Appointments"
        type="number"
        value={data.max_daily_appointments}
        onChange={(e) => onChange({ ...data, max_daily_appointments: e.target.value })}
        placeholder="50"
      />
      <Input
        label="Reminder Hours Before"
        type="number"
        value={data.reminder_hours_before}
        onChange={(e) => onChange({ ...data, reminder_hours_before: e.target.value })}
        placeholder="24"
      />
    </div>

    <div className="space-y-3">
      {(
        [
          ['allow_online_booking', 'Allow Online Booking'],
          ['auto_assign_doctor', 'Auto-Assign Doctor'],
          ['auto_check_in', 'Auto Check-In'],
          ['send_sms_reminders', 'Send SMS Reminders'],
          ['send_email_reminders', 'Send Email Reminders'],
        ] as [keyof BookingData, string][]
      ).map(([key, label]) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data[key] as boolean}
            onChange={(e) => onChange({ ...data, [key]: e.target.checked })}
            className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon/30"
          />
          <span className="text-sm text-carbon/80">{label}</span>
        </label>
      ))}
    </div>
  </div>
);

// ─── Step 4: Timetable ────────────────────────────────────────────────────────

interface SlotEntry {
  day: DayOfWeek;
  start: string;
  end: string;
  notes: string;
}

const TimetableStep = ({
  slots,
  onChange,
}: {
  slots: SlotEntry[];
  onChange: (s: SlotEntry[]) => void;
}) => {
  const addSlot = (day: DayOfWeek) => {
    onChange([...slots, { day, start: '08:00', end: '12:00', notes: '' }]);
  };

  const updateSlot = (i: number, patch: Partial<SlotEntry>) => {
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const removeSlot = (i: number) => {
    onChange(slots.filter((_, idx) => idx !== i));
  };

  const slotsByDay = (day: DayOfWeek) => slots.filter((s) => s.day === day);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-azure-dragon">Weekly Timetable</h3>
        <p className="text-xs text-carbon/50 mt-0.5">
          Define multiple time windows per day (e.g. 08:00–12:00 + 14:00–18:00). You can also
          configure this later.
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const daySlots = slotsByDay(day);
          return (
            <div key={day} className="rounded-lg border border-carbon/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-carbon capitalize">{day}</span>
                <Button variant="ghost" size="sm" onClick={() => addSlot(day)} className="h-7 text-xs">
                  <MdAdd className="h-3.5 w-3.5 mr-1" />
                  Add window
                </Button>
              </div>
              {daySlots.length === 0 && (
                <p className="text-xs text-carbon/35 italic">Closed / no slots</p>
              )}
              {slots.map((slot, i) =>
                slot.day !== day ? null : (
                  <div key={i} className="flex items-center gap-2 mt-1.5">
                    <input
                      type="time"
                      className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm text-carbon focus:outline-none focus:border-azure-dragon/60"
                      value={slot.start}
                      onChange={(e) => updateSlot(i, { start: e.target.value })}
                    />
                    <span className="text-xs text-carbon/40">to</span>
                    <input
                      type="time"
                      className="rounded-md border border-carbon/15 px-2 py-1.5 text-sm text-carbon focus:outline-none focus:border-azure-dragon/60"
                      value={slot.end}
                      onChange={(e) => updateSlot(i, { end: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-md border border-carbon/15 px-2 py-1.5 text-sm text-carbon placeholder:text-carbon/35 focus:outline-none focus:border-azure-dragon/60"
                      placeholder="Notes (optional)"
                      value={slot.notes}
                      onChange={(e) => updateSlot(i, { notes: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="text-smudged-lips hover:text-smudged-lips/80 p-1 rounded"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Step 5: Admin Setup ──────────────────────────────────────────────────────

interface AdminData {
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_phone: string;
}

const AdminStep = ({ data, onChange }: { data: AdminData; onChange: (d: AdminData) => void }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-base font-semibold text-azure-dragon">Clinic Admin Setup</h3>
      <p className="text-xs text-carbon/50 mt-0.5">
        Optionally create a clinic manager account. They will receive login credentials by email.
        You can skip this and add staff later.
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Admin Email"
        type="email"
        value={data.admin_email}
        onChange={(e) => onChange({ ...data, admin_email: e.target.value })}
        placeholder="manager@clinic.rw"
      />
      <Input
        label="Admin Phone"
        type="tel"
        value={data.admin_phone}
        onChange={(e) => onChange({ ...data, admin_phone: e.target.value })}
        placeholder="+250 7XX XXX XXX"
      />
      <Input
        label="First Name"
        value={data.admin_first_name}
        onChange={(e) => onChange({ ...data, admin_first_name: e.target.value })}
        placeholder="Jean"
      />
      <Input
        label="Last Name"
        value={data.admin_last_name}
        onChange={(e) => onChange({ ...data, admin_last_name: e.target.value })}
        placeholder="Baptiste"
      />
    </div>
    {!data.admin_email && (
      <p className="text-xs text-carbon/40 italic">
        Leave admin email blank to skip admin creation. You can add staff from the clinic management page.
      </p>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export const OrgClinicCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastStore();

  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  const createClinic = useCreateClinic();
  const initTimetable = useInitializeTimetable();

  const [step, setStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  // Step data
  const [basic, setBasic] = useState<BasicData>({
    name: '',
    clinic_code: '',
    description: '',
    type_ids: [],
    established_date: '',
    license_number: '',
  });
  const [location, setLocation] = useState<LocationData>({
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Rwanda',
    latitude: '',
    longitude: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    timezone: 'Africa/Kigali',
  });
  const [booking, setBooking] = useState<BookingData>({
    booking_mode: 'flexible',
    appointment_slot_duration: '30',
    max_daily_appointments: '50',
    allow_online_booking: true,
    auto_assign_doctor: false,
    auto_check_in: false,
    send_sms_reminders: true,
    send_email_reminders: true,
    reminder_hours_before: '24',
  });
  const [timetableSlots, setTimetableSlots] = useState<SlotEntry[]>([]);
  const [adminData, setAdminData] = useState<AdminData>({
    admin_email: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_phone: '',
  });

  const currentStep = STEPS[step]!;

  const canNext = () => {
    if (step === 0) return basic.name.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    setDoneSteps((prev) => [...new Set([...prev, step])]);
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      const payload: CreateClinicRequest = {
        name: basic.name,
        clinic_code: basic.clinic_code || undefined,
        description: basic.description || undefined,
        type_ids: basic.type_ids.length > 0 ? basic.type_ids : undefined,
        established_date: basic.established_date || undefined,
        license_number: basic.license_number || undefined,
        address: location.address || undefined,
        city: location.city || undefined,
        state: location.state || undefined,
        postal_code: location.postal_code || undefined,
        country: location.country || undefined,
        latitude: location.latitude ? parseFloat(location.latitude) : undefined,
        longitude: location.longitude ? parseFloat(location.longitude) : undefined,
        phone: location.phone || undefined,
        fax: location.fax || undefined,
        email: location.email || undefined,
        website: location.website || undefined,
        timezone: location.timezone,
        booking_mode: booking.booking_mode,
        appointment_slot_duration: booking.appointment_slot_duration
          ? parseInt(booking.appointment_slot_duration)
          : undefined,
        max_daily_appointments: booking.max_daily_appointments
          ? parseInt(booking.max_daily_appointments)
          : undefined,
        allow_online_booking: booking.allow_online_booking,
        auto_assign_doctor: booking.auto_assign_doctor,
        auto_check_in: booking.auto_check_in,
        send_sms_reminders: booking.send_sms_reminders,
        send_email_reminders: booking.send_email_reminders,
        reminder_hours_before: booking.reminder_hours_before
          ? parseInt(booking.reminder_hours_before)
          : undefined,
        organization_id: orgId || undefined,
        admin_email: adminData.admin_email || undefined,
        admin_first_name: adminData.admin_first_name || undefined,
        admin_last_name: adminData.admin_last_name || undefined,
        admin_phone: adminData.admin_phone || undefined,
      };

      const clinic = await createClinic.mutateAsync(payload);

      // Initialize timetable if slots were added
      if (timetableSlots.length > 0) {
        // Group by day_of_week → schedule array
        const grouped: Partial<Record<DayOfWeek, { start_time: string; end_time: string }[]>> = {};
        for (const s of timetableSlots) {
          if (!grouped[s.day]) grouped[s.day] = [];
          grouped[s.day]!.push({ start_time: s.start, end_time: s.end });
        }
        const schedule = (Object.entries(grouped) as [DayOfWeek, { start_time: string; end_time: string }[]][]).map(
          ([day_of_week, time_slots]) => ({ day_of_week, time_slots })
        );
        await initTimetable.mutateAsync({
          clinicId: clinic.clinic_id,
          data: { schedule, replace_existing: true, is_active: true },
        });
      }

      showSuccess(`Clinic "${clinic.name}" created successfully`);
      navigate(`/my-organization/clinics/${clinic.clinic_id}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create clinic');
    }
  };

  const isSubmitting = createClinic.isPending || initTimetable.isPending;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/my-organization/clinics')}
          className="rounded-md p-1.5 text-carbon/60 hover:bg-white-smoke hover:text-carbon transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon">Add New Clinic</h1>
          <p className="text-sm text-carbon/60">
            Step {step + 1} of {STEPS.length} — {currentStep.label}
          </p>
        </div>
      </div>

      <StepIndicator current={step} done={doneSteps} />

      <Card variant="elevated">
        <CardContent className="p-6">
          {step === 0 && <BasicInfoStep data={basic} onChange={setBasic} />}
          {step === 1 && <LocationStep data={location} onChange={setLocation} />}
          {step === 2 && <BookingStep data={booking} onChange={setBooking} />}
          {step === 3 && <TimetableStep slots={timetableSlots} onChange={setTimetableSlots} />}
          {step === 4 && <AdminStep data={adminData} onChange={setAdminData} />}
        </CardContent>
      </Card>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" size="md" onClick={handleBack} disabled={step === 0}>
          <MdArrowBack className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex gap-2">
          {!isLastStep ? (
            <Button variant="primary" size="md" onClick={handleNext} disabled={!canNext()}>
              Next
              <MdArrowForward className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loading size="sm" /> : 'Create Clinic'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
