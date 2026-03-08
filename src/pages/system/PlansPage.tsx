import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '@/hooks/usePlans';
import { useTranslation, PLAN, COMMON } from '@/i18n';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { Loading } from '@/components/ui/Loading';
import { MdAdd, MdSearch, MdFilterList, MdClear, MdEdit, MdVisibility, MdCheckCircle, MdCancel } from 'react-icons/md';
import type { PlanTier, BillingCycle, Plan } from '@/types/organization';

const TIER_OPTIONS: { value: PlanTier | ''; label: string; key: string }[] = [
  { value: '', label: 'All Tiers', key: '' },
  { value: 'free', label: '', key: PLAN.TIER_FREE },
  { value: 'starter', label: '', key: PLAN.TIER_STARTER },
  { value: 'professional', label: '', key: PLAN.TIER_PROFESSIONAL },
  { value: 'enterprise', label: '', key: PLAN.TIER_ENTERPRISE },
];

const CYCLE_OPTIONS: { value: BillingCycle | ''; label: string; key: string }[] = [
  { value: '', label: 'All Cycles', key: '' },
  { value: 'monthly', label: '', key: PLAN.MONTHLY },
  { value: 'quarterly', label: '', key: PLAN.QUARTERLY },
  { value: 'annual', label: '', key: PLAN.ANNUAL },
];

const tierColors: Record<PlanTier, string> = {
  free: 'bg-carbon/10 text-carbon',
  starter: 'bg-azure-dragon/10 text-azure-dragon',
  professional: 'bg-verdant/10 text-verdant',
  enterprise: 'bg-amber-100 text-amber-700',
};

export const PlansPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<PlanTier | ''>('');
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | ''>('');

  const { data: plans, isLoading, error } = usePlans({
    tier: tierFilter || undefined,
    billing_cycle: cycleFilter || undefined,
  });

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (!search.trim()) return plans;
    const q = search.toLowerCase();
    return plans.filter((p: Plan) => p.name.toLowerCase().includes(q));
  }, [plans, search]);

  const hasActiveFilters = search || tierFilter || cycleFilter;

  const handleClearFilters = () => {
    setSearch('');
    setTierFilter('');
    setCycleFilter('');
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(PLAN.PLANS)}
          </h1>
          <p className="text-sm text-carbon/60">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/system-admins/plans/create')}
        >
          <MdAdd className="h-4 w-4 mr-2" />
          {t(PLAN.CREATE_PLAN)}
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-4 w-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <MdClear className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Input
                label="Search"
                placeholder="Search by plan name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Select
              label={t(PLAN.TIER)}
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as PlanTier | '')}
              options={TIER_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.key ? t(opt.key) : opt.label,
              }))}
            />
            <Select
              label={t(PLAN.BILLING_CYCLE)}
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value as BillingCycle | '')}
              options={CYCLE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.key ? t(opt.key) : opt.label,
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error && (
        <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
          <p className="text-xs text-smudged-lips">{t(PLAN.FAILED_LOAD)}</p>
        </div>
      )}

      {isLoading ? (
        <Loading size="lg" className="py-12" />
      ) : (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {t(PLAN.PLANS)} ({filteredPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-carbon/60">{t(COMMON.NO_DATA)}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-carbon/10">
                      <th className="text-left py-3 px-4 font-medium text-carbon/70">{t(PLAN.NAME)}</th>
                      <th className="text-left py-3 px-4 font-medium text-carbon/70">{t(PLAN.TIER)}</th>
                      <th className="text-left py-3 px-4 font-medium text-carbon/70">{t(PLAN.BILLING_CYCLE)}</th>
                      <th className="text-right py-3 px-4 font-medium text-carbon/70">{t(PLAN.PRICE)}</th>
                      <th className="text-center py-3 px-4 font-medium text-carbon/70">{t(PLAN.TRIAL_DAYS)}</th>
                      <th className="text-center py-3 px-4 font-medium text-carbon/70">{t(COMMON.STATUS)}</th>
                      <th className="text-right py-3 px-4 font-medium text-carbon/70">{t(COMMON.ACTIONS)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan: Plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-carbon/5 hover:bg-carbon/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-carbon">{plan.name}</div>
                          {plan.description && (
                            <div className="text-xs text-carbon/50 mt-0.5 line-clamp-1">
                              {plan.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[plan.tier]}`}>
                            {plan.tier === 'free' && t(PLAN.TIER_FREE)}
                            {plan.tier === 'starter' && t(PLAN.TIER_STARTER)}
                            {plan.tier === 'professional' && t(PLAN.TIER_PROFESSIONAL)}
                            {plan.tier === 'enterprise' && t(PLAN.TIER_ENTERPRISE)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-carbon/70">
                          {plan.billing_cycle === 'monthly' && t(PLAN.MONTHLY)}
                          {plan.billing_cycle === 'quarterly' && t(PLAN.QUARTERLY)}
                          {plan.billing_cycle === 'annual' && t(PLAN.ANNUAL)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-carbon">
                          {formatPrice(plan.price, plan.currency)}
                        </td>
                        <td className="py-3 px-4 text-center text-carbon/70">
                          {plan.trial_days}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {plan.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-verdant">
                              <MdCheckCircle className="h-3.5 w-3.5" />
                              {t(COMMON.ACTIVE)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-carbon/40">
                              <MdCancel className="h-3.5 w-3.5" />
                              {t(COMMON.INACTIVE)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/system-admins/plans/${plan.id}`)}
                              title={t(COMMON.VIEW)}
                            >
                              <MdVisibility className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/system-admins/plans/${plan.id}/edit`)}
                              title={t(COMMON.EDIT)}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
