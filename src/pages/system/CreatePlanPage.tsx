import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePlan } from '@/hooks/usePlans';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, PLAN, COMMON } from '@/i18n';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { MdArrowBack, MdSave } from 'react-icons/md';
import type { CreatePlanRequest, PlanTier, BillingCycle, PlanLimits, PlanFeatures } from '@/types/organization';

const DEFAULT_LIMITS: PlanLimits = {
  max_doctors: 5,
  max_staff: 10,
  max_appointments_per_month: 500,
  max_patients: 1000,
  max_branches: 1,
  max_services: 20,
  max_sms_per_month: 100,
  storage_mb: 512,
};

const DEFAULT_FEATURES: PlanFeatures = {
  booking_widget: false,
  sms_reminders: false,
  email_reminders: false,
  queue_management: false,
  analytics_dashboard: false,
  advanced_analytics: false,
  api_access: false,
  webhooks: false,
  custom_roles: false,
  fhir_export: false,
  white_label: false,
  priority_support: false,
  csv_import: false,
  multi_language: false,
  payment_integration: false,
  audit_log_export: false,
};

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  booking_widget: 'Booking Widget',
  sms_reminders: 'SMS Reminders',
  email_reminders: 'Email Reminders',
  queue_management: 'Queue Management',
  analytics_dashboard: 'Analytics Dashboard',
  advanced_analytics: 'Advanced Analytics',
  api_access: 'API Access',
  webhooks: 'Webhooks',
  custom_roles: 'Custom Roles',
  fhir_export: 'FHIR Export',
  white_label: 'White Label',
  priority_support: 'Priority Support',
  csv_import: 'CSV Import',
  multi_language: 'Multi-Language',
  payment_integration: 'Payment Integration',
  audit_log_export: 'Audit Log Export',
};

export const CreatePlanPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createPlan = useCreatePlan();
  const { success: showSuccess, error: showError } = useToastStore();

  const [name, setName] = useState('');
  const [tier, setTier] = useState<PlanTier>('starter');
  const [description, setDescription] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('RWF');
  const [trialDays, setTrialDays] = useState<number>(0);
  const [limits, setLimits] = useState<PlanLimits>({ ...DEFAULT_LIMITS });
  const [features, setFeatures] = useState<PlanFeatures>({ ...DEFAULT_FEATURES });

  const updateLimit = (key: keyof PlanLimits, value: number) => {
    setLimits((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (key: keyof PlanFeatures) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Plan name is required');
      return;
    }

    const data: CreatePlanRequest = {
      name: name.trim(),
      tier,
      description: description.trim() || undefined,
      billing_cycle: billingCycle,
      price,
      currency,
      trial_days: trialDays,
      limits,
      features,
    };

    try {
      await createPlan.mutateAsync(data);
      showSuccess(t(PLAN.CREATED_SUCCESS));
      navigate('/system-admins/plans');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create plan';
      showError(errorMsg);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/system-admins/plans')}
        >
          <MdArrowBack className="h-4 w-4 mr-1" />
          {t(COMMON.BACK)}
        </Button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon">
            {t(PLAN.CREATE_PLAN)}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(PLAN.NAME)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Professional Monthly"
                required
              />
              <Select
                label={t(PLAN.TIER)}
                value={tier}
                onChange={(e) => setTier(e.target.value as PlanTier)}
                options={[
                  { value: 'free', label: t(PLAN.TIER_FREE) },
                  { value: 'starter', label: t(PLAN.TIER_STARTER) },
                  { value: 'professional', label: t(PLAN.TIER_PROFESSIONAL) },
                  { value: 'enterprise', label: t(PLAN.TIER_ENTERPRISE) },
                ]}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-carbon mb-1">
                  {t(PLAN.DESCRIPTION)}
                </label>
                <textarea
                  className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan description..."
                />
              </div>
              <Select
                label={t(PLAN.BILLING_CYCLE)}
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                options={[
                  { value: 'monthly', label: t(PLAN.MONTHLY) },
                  { value: 'quarterly', label: t(PLAN.QUARTERLY) },
                  { value: 'annual', label: t(PLAN.ANNUAL) },
                ]}
              />
              <Input
                label={t(PLAN.PRICE)}
                type="number"
                value={String(price)}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.CURRENCY)}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="RWF"
              />
              <Input
                label={t(PLAN.TRIAL_DAYS)}
                type="number"
                value={String(trialDays)}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>{t(PLAN.LIMITS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Input
                label={t(PLAN.MAX_DOCTORS)}
                type="number"
                value={String(limits.max_doctors)}
                onChange={(e) => updateLimit('max_doctors', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_STAFF)}
                type="number"
                value={String(limits.max_staff)}
                onChange={(e) => updateLimit('max_staff', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_APPOINTMENTS)}
                type="number"
                value={String(limits.max_appointments_per_month)}
                onChange={(e) => updateLimit('max_appointments_per_month', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_PATIENTS)}
                type="number"
                value={String(limits.max_patients)}
                onChange={(e) => updateLimit('max_patients', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_BRANCHES)}
                type="number"
                value={String(limits.max_branches)}
                onChange={(e) => updateLimit('max_branches', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_SERVICES)}
                type="number"
                value={String(limits.max_services)}
                onChange={(e) => updateLimit('max_services', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.MAX_SMS)}
                type="number"
                value={String(limits.max_sms_per_month)}
                onChange={(e) => updateLimit('max_sms_per_month', Number(e.target.value))}
                min="0"
              />
              <Input
                label={t(PLAN.STORAGE)}
                type="number"
                value={String(limits.storage_mb)}
                onChange={(e) => updateLimit('storage_mb', Number(e.target.value))}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>{t(PLAN.FEATURES)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(FEATURE_LABELS) as Array<keyof PlanFeatures>).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer rounded-md border border-carbon/10 px-3 py-2 hover:bg-carbon/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={features[key]}
                    onChange={() => toggleFeature(key)}
                    className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                  />
                  <span className="text-sm text-carbon">{FEATURE_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => navigate('/system-admins/plans')}
          >
            {t(COMMON.CANCEL)}
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={createPlan.isPending}
          >
            <MdSave className="h-4 w-4 mr-2" />
            {createPlan.isPending ? t(COMMON.SAVING) : t(PLAN.CREATE_PLAN)}
          </Button>
        </div>
      </form>
    </div>
  );
};
