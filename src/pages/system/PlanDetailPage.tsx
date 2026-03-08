import { useNavigate, useParams } from 'react-router-dom';
import { usePlan } from '@/hooks/usePlans';
import { useTranslation, PLAN, COMMON } from '@/i18n';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Loading } from '@/components/ui/Loading';
import { MdArrowBack, MdEdit, MdCheckCircle, MdCancel } from 'react-icons/md';
import type { PlanFeatures, PlanLimits } from '@/types/organization';

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

const LIMIT_LABELS: Record<keyof PlanLimits, string> = {
  max_doctors: 'Max Doctors',
  max_staff: 'Max Staff',
  max_appointments_per_month: 'Max Appointments/Month',
  max_patients: 'Max Patients',
  max_branches: 'Max Branches',
  max_services: 'Max Services',
  max_sms_per_month: 'Max SMS/Month',
  storage_mb: 'Storage (MB)',
};

const tierColors: Record<string, string> = {
  free: 'bg-carbon/10 text-carbon',
  starter: 'bg-azure-dragon/10 text-azure-dragon',
  professional: 'bg-verdant/10 text-verdant',
  enterprise: 'bg-amber-100 text-amber-700',
};

const ALL_FEATURE_KEYS = Object.keys(FEATURE_LABELS) as Array<keyof PlanFeatures>;
const ALL_LIMIT_KEYS = Object.keys(LIMIT_LABELS) as Array<keyof PlanLimits>;

export const PlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: plan, isLoading, error } = usePlan(id || '');

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free': return t(PLAN.TIER_FREE);
      case 'starter': return t(PLAN.TIER_STARTER);
      case 'professional': return t(PLAN.TIER_PROFESSIONAL);
      case 'enterprise': return t(PLAN.TIER_ENTERPRISE);
      default: return tier;
    }
  };

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return t(PLAN.MONTHLY);
      case 'quarterly': return t(PLAN.QUARTERLY);
      case 'annual': return t(PLAN.ANNUAL);
      default: return cycle;
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="py-24" />;
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
          <p className="text-xs text-smudged-lips">{t(PLAN.FAILED_LOAD)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/system-admins/plans')}>
          <MdArrowBack className="h-4 w-4 mr-1" />
          {t(COMMON.BACK)}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
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
              {plan.name}
            </h1>
            <p className="text-sm text-carbon/60">{t(PLAN.PLAN_DETAILS)}</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate(`/system-admins/plans/${plan.id}/edit`)}
        >
          <MdEdit className="h-4 w-4 mr-2" />
          {t(COMMON.EDIT)}
        </Button>
      </div>

      {/* Overview */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.NAME)}</p>
              <p className="text-sm font-medium text-carbon">{plan.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.TIER)}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[plan.tier] || 'bg-carbon/10 text-carbon'}`}>
                {getTierLabel(plan.tier)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(COMMON.STATUS)}</p>
              {plan.is_active ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-verdant">
                  <MdCheckCircle className="h-4 w-4" />
                  {t(COMMON.ACTIVE)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-carbon/40">
                  <MdCancel className="h-4 w-4" />
                  {t(COMMON.INACTIVE)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.BILLING_CYCLE)}</p>
              <p className="text-sm font-medium text-carbon">{getCycleLabel(plan.billing_cycle)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.PRICE)}</p>
              <p className="text-sm font-medium text-carbon">
                {plan.currency} {plan.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.TRIAL_DAYS)}</p>
              <p className="text-sm font-medium text-carbon">{plan.trial_days} days</p>
            </div>
            {plan.description && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs font-medium text-carbon/50 uppercase tracking-wide mb-1">{t(PLAN.DESCRIPTION)}</p>
                <p className="text-sm text-carbon/80">{plan.description}</p>
              </div>
            )}
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
            {ALL_LIMIT_KEYS.map((key) => {
              const value = plan.limits?.[key] ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-lg border border-carbon/10 p-3"
                >
                  <p className="text-xs font-medium text-carbon/50 mb-1">
                    {LIMIT_LABELS[key]}
                  </p>
                  <p className="text-lg font-semibold text-carbon">
                    {value.toLocaleString()}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-carbon/10">
                    <div
                      className="h-1.5 rounded-full bg-azure-dragon"
                      style={{ width: `${Math.min((value / (value * 1.5 || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
            {ALL_FEATURE_KEYS.map((key) => {
              const enabled = plan.features?.[key] ?? false;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                    enabled
                      ? 'border-verdant/20 bg-verdant/5'
                      : 'border-carbon/10 bg-carbon/5'
                  }`}
                >
                  {enabled ? (
                    <MdCheckCircle className="h-4 w-4 text-verdant flex-shrink-0" />
                  ) : (
                    <MdCancel className="h-4 w-4 text-carbon/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${enabled ? 'text-carbon' : 'text-carbon/40'}`}>
                    {FEATURE_LABELS[key]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
