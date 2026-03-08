import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useOnboarding,
  useStartOnboarding,
  useSaveOnboardingStep,
  useSkipOnboarding,
  useCompleteOnboarding,
} from '@/hooks/useOnboarding';
import { usePlans } from '@/hooks/usePlans';
import { useTranslation, ONBOARDING } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Button, Card, CardContent, Loading } from '@/components/ui';
import {
  MdCheckCircle,
  MdArrowForward,
  MdArrowBack,
  MdSkipNext,
  MdRocketLaunch,
  MdLocalHospital,
  MdSchedule,
  MdMedicalServices,
  MdPeople,
  MdCreditCard,
} from 'react-icons/md';
import type { Plan } from '@/types/organization';

// ─── Step definitions ───────────────────────────────────────────────────────

const STEPS = [
  { slug: 'clinic-info', label: 'Clinic Info', icon: MdLocalHospital },
  { slug: 'operating-hours', label: 'Operating Hours', icon: MdSchedule },
  { slug: 'services', label: 'Services', icon: MdMedicalServices },
  { slug: 'staff', label: 'Staff', icon: MdPeople },
  { slug: 'subscription', label: 'Subscription', icon: MdCreditCard },
] as const;


// ─── Day-of-week helpers ────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

const defaultHours = (): Record<string, DayHours> =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      d === 'Sunday' ? { open: '', close: '', closed: true } : { open: '08:00', close: '17:00', closed: false },
    ]),
  );

// ─── Step indicator ─────────────────────────────────────────────────────────

const StepIndicator = ({
  currentIndex,
  completedSteps,
}: {
  currentIndex: number;
  completedSteps: string[];
}) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((step, i) => {
      const done = completedSteps.includes(step.slug);
      const active = i === currentIndex;
      const Icon = step.icon;
      return (
        <div key={step.slug} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                done
                  ? 'border-green-500 bg-green-500 text-white'
                  : active
                    ? 'border-azure-dragon bg-azure-dragon text-white'
                    : 'border-carbon/20 bg-white text-carbon/40'
              }`}
            >
              {done ? <MdCheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span
              className={`mt-1 text-xs font-medium hidden sm:block ${
                active ? 'text-azure-dragon' : done ? 'text-green-600' : 'text-carbon/40'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 h-0.5 w-8 sm:w-12 ${
                completedSteps.includes(STEPS[i + 1]?.slug ?? '') || i < currentIndex
                  ? 'bg-green-500'
                  : 'bg-carbon/15'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step: Clinic Info ──────────────────────────────────────────────────────

const ClinicInfoStep = ({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-azure-dragon">Clinic Information</h3>
    <p className="text-sm text-carbon/60">Confirm or update your clinic's basic details.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-carbon/80">Clinic Name</label>
        <input
          type="text"
          className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
          value={(data.name as string) || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Kigali Health Center"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-carbon/80">Phone</label>
        <input
          type="tel"
          className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
          value={(data.phone as string) || ''}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+250 7XX XXX XXX"
        />
      </div>
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-carbon/80">Address</label>
      <input
        type="text"
        className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
        value={(data.address as string) || ''}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
        placeholder="Street, City, Province"
      />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-carbon/80">Email</label>
      <input
        type="email"
        className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
        value={(data.email as string) || ''}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        placeholder="clinic@example.com"
      />
    </div>
  </div>
);

// ─── Step: Operating Hours ──────────────────────────────────────────────────

const OperatingHoursStep = ({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) => {
  const hours = (data.hours as Record<string, DayHours>) || defaultHours();

  const update = (day: string, field: keyof DayHours, value: string | boolean) => {
    const updated = { ...hours, [day]: { ...hours[day], [field]: value } };
    onChange({ ...data, hours: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-azure-dragon">Operating Hours</h3>
      <p className="text-sm text-carbon/60">Set your clinic's operating hours for each day of the week.</p>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dh = hours[day] || { open: '08:00', close: '17:00', closed: false };
          return (
            <div key={day} className="flex items-center gap-3 rounded-md border border-carbon/10 px-3 py-2">
              <span className="w-24 text-sm font-medium text-carbon/80">{day}</span>
              <label className="flex items-center gap-1 text-xs text-carbon/60">
                <input
                  type="checkbox"
                  checked={dh.closed}
                  onChange={(e) => update(day, 'closed', e.target.checked)}
                  className="rounded"
                />
                Closed
              </label>
              {!dh.closed && (
                <>
                  <input
                    type="time"
                    className="rounded border border-carbon/20 px-2 py-1 text-sm"
                    value={dh.open}
                    onChange={(e) => update(day, 'open', e.target.value)}
                  />
                  <span className="text-sm text-carbon/40">to</span>
                  <input
                    type="time"
                    className="rounded border border-carbon/20 px-2 py-1 text-sm"
                    value={dh.close}
                    onChange={(e) => update(day, 'close', e.target.value)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Step: Services ─────────────────────────────────────────────────────────

const ServicesStep = ({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) => {
  const services = (data.services as Array<{ name: string; duration: number; price: number }>) || [];

  const addService = () => {
    onChange({ ...data, services: [...services, { name: '', duration: 30, price: 0 }] });
  };

  const updateService = (index: number, field: string, value: string | number) => {
    const updated = services.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange({ ...data, services: updated });
  };

  const removeService = (index: number) => {
    onChange({ ...data, services: services.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-azure-dragon">Initial Services</h3>
      <p className="text-sm text-carbon/60">Add the services your clinic offers. You can add more later.</p>
      {services.map((svc, i) => (
        <div key={i} className="flex items-end gap-3 rounded-md border border-carbon/10 p-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Service Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={svc.name}
              onChange={(e) => updateService(i, 'name', e.target.value)}
              placeholder="e.g. General Consultation"
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Duration (min)</label>
            <input
              type="number"
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={svc.duration}
              onChange={(e) => updateService(i, 'duration', Number(e.target.value))}
              min={5}
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Price (RWF)</label>
            <input
              type="number"
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={svc.price}
              onChange={(e) => updateService(i, 'price', Number(e.target.value))}
              min={0}
            />
          </div>
          <button
            onClick={() => removeService(i)}
            className="mb-0.5 rounded p-2 text-smudged-lips hover:bg-smudged-lips/10"
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addService}>
        + Add Service
      </Button>
    </div>
  );
};

// ─── Step: Staff ────────────────────────────────────────────────────────────

const StaffStep = ({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) => {
  const staff = (data.staff as Array<{ name: string; email: string; role: string }>) || [];

  const addStaff = () => {
    onChange({ ...data, staff: [...staff, { name: '', email: '', role: 'DOCTOR' }] });
  };

  const updateStaff = (index: number, field: string, value: string) => {
    const updated = staff.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange({ ...data, staff: updated });
  };

  const removeStaff = (index: number) => {
    onChange({ ...data, staff: staff.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-azure-dragon">Initial Staff</h3>
      <p className="text-sm text-carbon/60">Add doctors and staff members. They will receive an invitation email.</p>
      {staff.map((member, i) => (
        <div key={i} className="flex items-end gap-3 rounded-md border border-carbon/10 p-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Full Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={member.name}
              onChange={(e) => updateStaff(i, 'name', e.target.value)}
              placeholder="Dr. Jean Baptiste"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={member.email}
              onChange={(e) => updateStaff(i, 'email', e.target.value)}
              placeholder="doctor@clinic.com"
            />
          </div>
          <div className="w-36">
            <label className="mb-1 block text-xs font-medium text-carbon/60">Role</label>
            <select
              className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none"
              value={member.role}
              onChange={(e) => updateStaff(i, 'role', e.target.value)}
            >
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <button
            onClick={() => removeStaff(i)}
            className="mb-0.5 rounded p-2 text-smudged-lips hover:bg-smudged-lips/10"
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addStaff}>
        + Add Staff Member
      </Button>
    </div>
  );
};

// ─── Step: Subscription ─────────────────────────────────────────────────────

const SubscriptionStep = ({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) => {
  const { data: plans, isLoading } = usePlans({ billing_cycle: 'monthly' });
  const selectedPlanId = (data.plan_id as string) || '';
  const startTrial = (data.start_trial as boolean) ?? true;

  const tierColors: Record<string, string> = {
    free: 'border-carbon/20',
    starter: 'border-blue-400',
    professional: 'border-azure-dragon',
    enterprise: 'border-amber-500',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  const planList: Plan[] = Array.isArray(plans) ? plans : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-azure-dragon">Choose a Plan</h3>
      <p className="text-sm text-carbon/60">Select a subscription plan for your clinic. You can change this later.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {planList.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange({ ...data, plan_id: plan.id, start_trial: startTrial })}
            className={`rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
              selectedPlanId === plan.id
                ? 'border-azure-dragon bg-azure-dragon/5 ring-1 ring-azure-dragon'
                : tierColors[plan.tier] || 'border-carbon/20'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-carbon/50">{plan.tier}</span>
              {selectedPlanId === plan.id && <MdCheckCircle className="h-5 w-5 text-azure-dragon" />}
            </div>
            <h4 className="text-lg font-semibold text-azure-dragon">{plan.name}</h4>
            {plan.description && <p className="mt-1 text-xs text-carbon/60">{plan.description}</p>}
            <div className="mt-3">
              <span className="text-2xl font-bold text-carbon">
                {plan.price === 0 ? 'Free' : `${plan.price.toLocaleString()} ${plan.currency}`}
              </span>
              {plan.price > 0 && <span className="text-sm text-carbon/50"> / {plan.billing_cycle}</span>}
            </div>
            {plan.trial_days > 0 && (
              <p className="mt-1 text-xs text-green-600">{plan.trial_days}-day free trial</p>
            )}
            <ul className="mt-3 space-y-1 text-xs text-carbon/70">
              <li>Up to {plan.limits.max_doctors} doctors</li>
              <li>Up to {plan.limits.max_patients} patients</li>
              <li>{plan.limits.max_appointments_per_month} appointments/month</li>
            </ul>
          </button>
        ))}
      </div>

      {planList.length === 0 && (
        <div className="rounded-md bg-carbon/5 p-6 text-center text-sm text-carbon/60">
          No plans available. You can skip this step and subscribe later.
        </div>
      )}

      {selectedPlanId && (
        <label className="flex items-center gap-2 text-sm text-carbon/70">
          <input
            type="checkbox"
            checked={startTrial}
            onChange={(e) => onChange({ ...data, start_trial: e.target.checked })}
            className="rounded"
          />
          Start with a free trial
        </label>
      )}
    </div>
  );
};

// ─── Welcome screen ─────────────────────────────────────────────────────────

const WelcomeScreen = ({ onStart, isStarting }: { onStart: () => void; isStarting: boolean }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-azure-dragon/10">
        <MdRocketLaunch className="h-10 w-10 text-azure-dragon" />
      </div>
      <h2 className="mb-2 text-2xl font-heading font-bold text-azure-dragon">{t(ONBOARDING.WELCOME)}</h2>
      <p className="mb-8 max-w-md text-sm text-carbon/60">{t(ONBOARDING.SETUP_CLINIC)}</p>
      <p className="mb-8 max-w-lg text-sm text-carbon/50">
        We'll walk you through 5 quick steps to get your clinic up and running: clinic info,
        operating hours, services, staff, and choosing a subscription plan.
      </p>
      <Button variant="primary" size="lg" onClick={onStart} disabled={isStarting}>
        {isStarting ? <Loading size="sm" /> : t(ONBOARDING.START)}
      </Button>
    </div>
  );
};

// ─── Success screen ─────────────────────────────────────────────────────────

const SuccessScreen = ({ onGoDashboard }: { onGoDashboard: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <MdCheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="mb-2 text-2xl font-heading font-bold text-green-700">All Set!</h2>
      <p className="mb-2 text-sm text-carbon/70">{t(ONBOARDING.ONBOARDING_COMPLETED)}</p>
      <p className="mb-8 max-w-md text-sm text-carbon/50">
        Your clinic has been configured and is ready to accept appointments.
        Check your Getting Started Checklist for additional tasks.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="lg" onClick={onGoDashboard}>
          Go to Dashboard
        </Button>
        <Button variant="outline" size="lg" onClick={() => onGoDashboard()}>
          View Checklist
        </Button>
      </div>
    </div>
  );
};

// ─── Main OnboardingPage ────────────────────────────────────────────────────

export const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user } = useAuth();
  const clinicId = user?.clinic_id || user?.employee?.clinic_id || '';

  const { data: onboarding, isLoading, error } = useOnboarding(clinicId);
  const startMutation = useStartOnboarding();
  const saveMutation = useSaveOnboardingStep();
  const skipMutation = useSkipOnboarding();
  const completeMutation = useCompleteOnboarding();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, Record<string, unknown>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync onboarding state from server
  useEffect(() => {
    if (onboarding) {
      if (onboarding.status === 'completed' || onboarding.status === 'skipped') {
        navigate('/dashboard', { replace: true });
        return;
      }
      if (onboarding.current_step > 0) {
        setCurrentStepIndex(Math.min(onboarding.current_step - 1, STEPS.length - 1));
      }
      if (onboarding.step_data) {
        const restored: Record<string, Record<string, unknown>> = {};
        for (const [key, value] of Object.entries(onboarding.step_data)) {
          restored[key] = value as Record<string, unknown>;
        }
        setStepData((prev) => ({ ...restored, ...prev }));
      }
    }
  }, [onboarding, navigate]);

  const completedSteps = useMemo(() => onboarding?.completed_steps || [], [onboarding]);
  // currentStepIndex is always within bounds (0..4) when wizard renders
  const currentStep = STEPS[currentStepIndex] as (typeof STEPS)[number];
  const currentStepData = currentStep ? stepData[currentStep.slug] || {} : {};

  // ─── Handlers ───────────────────────────────────────────────────────

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync({ clinicId });
      toast.success(t(ONBOARDING.STARTED_SUCCESS));
    } catch {
      toast.error('Failed to start onboarding');
    }
  };

  const handleSaveAndNext = async () => {
    try {
      await saveMutation.mutateAsync({
        clinicId,
        stepSlug: currentStep!.slug,
        stepData: currentStepData,
      });
      toast.success(t(ONBOARDING.STEP_COMPLETED));

      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex((i) => i + 1);
      }
    } catch {
      toast.error('Failed to save step');
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  const handleSkip = async () => {
    try {
      await skipMutation.mutateAsync(clinicId);
      toast.info(t(ONBOARDING.ONBOARDING_SKIPPED));
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Failed to skip onboarding');
    }
  };

  const handleComplete = async () => {
    // Save current step first
    try {
      await saveMutation.mutateAsync({
        clinicId,
        stepSlug: currentStep!.slug,
        stepData: currentStepData,
      });
    } catch {
      // proceed anyway
    }

    try {
      const planId = (stepData['subscription']?.plan_id as string) || undefined;
      const startTrial = (stepData['subscription']?.start_trial as boolean) ?? undefined;
      await completeMutation.mutateAsync({
        clinicId,
        data: { plan_id: planId, start_trial: startTrial },
      });
      toast.success(t(ONBOARDING.ONBOARDING_COMPLETED));
      setShowSuccess(true);
    } catch {
      toast.error('Failed to complete onboarding');
    }
  };

  const updateCurrentStepData = (data: Record<string, unknown>) => {
    setStepData((prev) => ({ ...prev, [currentStep.slug]: data }));
  };

  // ─── Render ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && !onboarding) {
    // Not started — show welcome
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent>
            <WelcomeScreen onStart={handleStart} isStarting={startMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!onboarding || onboarding.status === 'not_started') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent>
            <WelcomeScreen onStart={handleStart} isStarting={startMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent>
            <SuccessScreen onGoDashboard={() => navigate('/dashboard')} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Wizard ─────────────────────────────────────────────────────────

  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isSaving = saveMutation.isPending || completeMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon">{t(ONBOARDING.SETUP_CLINIC)}</h1>
        <p className="text-sm text-carbon/60">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentIndex={currentStepIndex} completedSteps={completedSteps} />

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {currentStep.slug === 'clinic-info' && (
            <ClinicInfoStep data={currentStepData} onChange={updateCurrentStepData} />
          )}
          {currentStep.slug === 'operating-hours' && (
            <OperatingHoursStep data={currentStepData} onChange={updateCurrentStepData} />
          )}
          {currentStep.slug === 'services' && (
            <ServicesStep data={currentStepData} onChange={updateCurrentStepData} />
          )}
          {currentStep.slug === 'staff' && (
            <StaffStep data={currentStepData} onChange={updateCurrentStepData} />
          )}
          {currentStep.slug === 'subscription' && (
            <SubscriptionStep data={currentStepData} onChange={updateCurrentStepData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {currentStepIndex > 0 && (
            <Button variant="outline" size="md" onClick={handlePrevious} disabled={isSaving}>
              <MdArrowBack className="mr-1 h-4 w-4" />
              {t(ONBOARDING.PREVIOUS_STEP)}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="md" onClick={handleSkip} disabled={skipMutation.isPending}>
            <MdSkipNext className="mr-1 h-4 w-4" />
            {t(ONBOARDING.SKIP)}
          </Button>

          {isLastStep ? (
            <Button variant="primary" size="md" onClick={handleComplete} disabled={isSaving}>
              {isSaving ? <Loading size="sm" /> : t(ONBOARDING.COMPLETE)}
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSaveAndNext} disabled={isSaving}>
              {isSaving ? (
                <Loading size="sm" />
              ) : (
                <>
                  {t(ONBOARDING.NEXT_STEP)}
                  <MdArrowForward className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
