import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinicSubscription, useCancelSubscription, useReactivateSubscription, useUpgradeSubscription } from '@/hooks/useSubscriptions';
import { usePlans } from '@/hooks/usePlans';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, SUBSCRIPTION, PLAN, COMMON } from '@/i18n';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Modal, Select } from '@/components/ui';
import {
  MdArrowBack,
  MdCreditCard,
  MdUpgrade,
  MdCancel,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdTimeline,
} from 'react-icons/md';
import { format, differenceInDays, parseISO } from 'date-fns';
import type { CancelReason } from '@/types/organization';

const statusConfig: Record<string, { color: string; icon: typeof MdCheckCircle }> = {
  trialing: { color: 'bg-azure-dragon/10 text-azure-dragon', icon: MdInfo },
  active: { color: 'bg-verdant/10 text-verdant', icon: MdCheckCircle },
  past_due: { color: 'bg-amber-100 text-amber-700', icon: MdWarning },
  canceled: { color: 'bg-carbon/10 text-carbon/60', icon: MdCancel },
  expired: { color: 'bg-smudged-lips/10 text-smudged-lips', icon: MdCancel },
};

const CANCEL_REASONS: { value: CancelReason; labelKey: string }[] = [
  { value: 'too_expensive', labelKey: SUBSCRIPTION.REASON_TOO_EXPENSIVE },
  { value: 'missing_features', labelKey: SUBSCRIPTION.REASON_MISSING_FEATURES },
  { value: 'switching_provider', labelKey: SUBSCRIPTION.REASON_SWITCHING },
  { value: 'closing_clinic', labelKey: SUBSCRIPTION.REASON_CLOSING },
  { value: 'other', labelKey: SUBSCRIPTION.REASON_OTHER },
];

export const SubscriptionDetailPage = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const { data: subscription, isLoading, error } = useClinicSubscription(clinicId || '');
  const { data: plans } = usePlans();
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();
  const upgradeMutation = useUpgradeSubscription();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReason>('too_expensive');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const handleCancel = async () => {
    if (!subscription) return;
    try {
      await cancelMutation.mutateAsync({
        id: subscription.id,
        data: { reason: cancelReason, feedback: cancelFeedback || undefined, cancel_at: 'end_of_period' },
      });
      showSuccess(t(SUBSCRIPTION.CANCELED_SUCCESS));
      setShowCancelModal(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    try {
      await reactivateMutation.mutateAsync(subscription.id);
      showSuccess(t(SUBSCRIPTION.REACTIVATED_SUCCESS));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reactivate');
    }
  };

  const handleUpgrade = async () => {
    if (!subscription || !selectedPlanId) return;
    try {
      await upgradeMutation.mutateAsync({
        id: subscription.id,
        data: { plan_id: selectedPlanId, effective: 'immediate' },
      });
      showSuccess(t(SUBSCRIPTION.UPGRADED_SUCCESS));
      setShowUpgradeModal(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upgrade');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <Loading />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <MdArrowBack className="h-4 w-4 mr-1" />
          {t(COMMON.BACK)}
        </Button>
        <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-8 text-center">
          <p className="text-sm text-smudged-lips">{t(SUBSCRIPTION.FAILED_LOAD)}</p>
        </div>
      </div>
    );
  }

  const statusCfg = statusConfig[subscription.status] ?? statusConfig.expired!;
  const StatusIcon = statusCfg.icon;
  const daysRemaining = subscription.current_period_end
    ? differenceInDays(parseISO(subscription.current_period_end), new Date())
    : 0;
  const trialDaysRemaining = subscription.trial_end
    ? differenceInDays(parseISO(subscription.trial_end), new Date())
    : 0;

  const availablePlans = plans?.filter((p) => p.id !== subscription.plan_id && p.is_active) || [];

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <MdArrowBack className="h-4 w-4 mr-1" />
        {t(COMMON.BACK)}
      </Button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(SUBSCRIPTION.SUBSCRIPTION)}
          </h1>
          <p className="text-sm text-carbon/60">{t(SUBSCRIPTION.MANAGE_SUBSCRIPTION)}</p>
        </div>
        <div className="flex gap-2">
          {(subscription.status === 'active' || subscription.status === 'trialing') && (
            <>
              <Button variant="outline" size="md" onClick={() => setShowUpgradeModal(true)}>
                <MdUpgrade className="h-4 w-4 mr-2" />
                {t(SUBSCRIPTION.UPGRADE)}
              </Button>
              <Button variant="danger" size="md" onClick={() => setShowCancelModal(true)}>
                <MdCancel className="h-4 w-4 mr-2" />
                {t(SUBSCRIPTION.CANCEL)}
              </Button>
            </>
          )}
          {subscription.status === 'canceled' && (
            <Button
              variant="primary"
              size="md"
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
            >
              <MdRefresh className="h-4 w-4 mr-2" />
              {t(SUBSCRIPTION.REACTIVATE)}
            </Button>
          )}
        </div>
      </div>

      {/* Status & Plan Overview */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCreditCard className="h-5 w-5 text-azure-dragon" />
              {t(PLAN.PLAN_DETAILS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-carbon/60">{t(PLAN.NAME)}</span>
                <span className="text-sm font-medium text-carbon">{subscription.plan_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-carbon/60">{t(PLAN.TIER)}</span>
                <span className="text-sm font-medium text-carbon capitalize">{subscription.plan_tier || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-carbon/60">Status</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {t(SUBSCRIPTION[`STATUS_${subscription.status.toUpperCase()}` as keyof typeof SUBSCRIPTION] || subscription.status)}
                </span>
              </div>
              {subscription.payment_method && (
                <div className="flex justify-between">
                  <span className="text-sm text-carbon/60">Payment</span>
                  <span className="text-sm font-medium text-carbon">
                    {t(SUBSCRIPTION[`PAYMENT_${subscription.payment_method.toUpperCase()}` as keyof typeof SUBSCRIPTION] || subscription.payment_method)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdTimeline className="h-5 w-5 text-azure-dragon" />
              {t(SUBSCRIPTION.CURRENT_PERIOD)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-carbon/60">Start</span>
                <span className="text-sm font-medium text-carbon">
                  {format(parseISO(subscription.current_period_start), 'PP')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-carbon/60">End</span>
                <span className="text-sm font-medium text-carbon">
                  {format(parseISO(subscription.current_period_end), 'PP')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-carbon/60">Remaining</span>
                <span className={`text-sm font-medium ${daysRemaining <= 7 ? 'text-smudged-lips' : 'text-carbon'}`}>
                  {t(SUBSCRIPTION.DAYS_REMAINING, { days: Math.max(0, daysRemaining) })}
                </span>
              </div>
              {subscription.status === 'trialing' && subscription.trial_end && (
                <div className="flex justify-between">
                  <span className="text-sm text-carbon/60">{t(SUBSCRIPTION.TRIAL_ENDS)}</span>
                  <span className="text-sm font-medium text-azure-dragon">
                    {format(parseISO(subscription.trial_end), 'PP')} ({trialDaysRemaining}d)
                  </span>
                </div>
              )}
              {subscription.canceled_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-carbon/60">Canceled</span>
                  <span className="text-sm font-medium text-smudged-lips">
                    {format(parseISO(subscription.canceled_at), 'PP')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Limits */}
      {subscription.limits && (
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>{t(PLAN.LIMITS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {([
                { key: 'max_doctors', label: t(PLAN.MAX_DOCTORS) },
                { key: 'max_staff', label: t(PLAN.MAX_STAFF) },
                { key: 'max_appointments_per_month', label: t(PLAN.MAX_APPOINTMENTS) },
                { key: 'max_patients', label: t(PLAN.MAX_PATIENTS) },
                { key: 'max_branches', label: t(PLAN.MAX_BRANCHES) },
                { key: 'max_services', label: t(PLAN.MAX_SERVICES) },
                { key: 'max_sms_per_month', label: t(PLAN.MAX_SMS) },
                { key: 'storage_mb', label: t(PLAN.STORAGE) },
              ] as const).map(({ key, label }) => {
                const value = subscription.limits?.[key as keyof typeof subscription.limits];
                return (
                  <div key={key} className="rounded-lg border border-carbon/10 p-3">
                    <p className="text-xs text-carbon/60 mb-1">{label}</p>
                    <p className="text-lg font-semibold text-carbon">
                      {value === -1 ? '∞' : (value ?? '—')}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {subscription.features && Object.keys(subscription.features).length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(PLAN.FEATURES)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(subscription.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center gap-2 py-1">
                  {enabled ? (
                    <MdCheckCircle className="h-4 w-4 text-verdant flex-shrink-0" />
                  ) : (
                    <MdCancel className="h-4 w-4 text-carbon/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${enabled ? 'text-carbon' : 'text-carbon/40'}`}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title={t(SUBSCRIPTION.CANCEL)}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                Your subscription will remain active until the end of the current billing period.
              </p>
            </div>
            <Select
              label="Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value as CancelReason)}
              options={CANCEL_REASONS.map((r) => ({ value: r.value, label: t(r.labelKey) }))}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">Feedback (optional)</label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                placeholder="Tell us how we can improve..."
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setShowCancelModal(false)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? t(COMMON.SAVING) : t(SUBSCRIPTION.CANCEL)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <Modal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title={t(SUBSCRIPTION.UPGRADE)}
          size="lg"
        >
          <div className="space-y-4">
            {availablePlans.length === 0 ? (
              <p className="text-sm text-carbon/60 text-center py-4">No other plans available.</p>
            ) : (
              <div className="grid gap-3">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedPlanId === plan.id
                        ? 'border-azure-dragon bg-azure-dragon/5'
                        : 'border-carbon/15 hover:border-azure-dragon/50'
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-carbon">{plan.name}</p>
                        <p className="text-xs text-carbon/60 capitalize">{plan.tier} · {plan.billing_cycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-carbon">
                          {plan.price.toLocaleString()} {plan.currency}
                        </p>
                        <p className="text-xs text-carbon/50">/{plan.billing_cycle}</p>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-carbon/50 mt-2">{plan.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setShowUpgradeModal(false)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleUpgrade}
                disabled={!selectedPlanId || upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? t(COMMON.SAVING) : t(SUBSCRIPTION.UPGRADE)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
