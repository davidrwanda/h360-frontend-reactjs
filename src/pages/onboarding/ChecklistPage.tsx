import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useOnboardingChecklist,
  useCompleteChecklistItem,
  useDismissChecklistItem,
} from '@/hooks/useOnboarding';
import { useTranslation, ONBOARDING } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Button, Card, CardContent, Loading } from '@/components/ui';
import {
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdClose,
  MdOpenInNew,
  MdChecklist,
} from 'react-icons/md';
import type { OnboardingChecklistItem } from '@/types/organization';

// ─── Progress bar ───────────────────────────────────────────────────────────

const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-carbon/80">
          {completed} of {total} completed
        </span>
        <span className="font-semibold text-azure-dragon">{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-carbon/10">
        <div
          className="h-full rounded-full bg-azure-dragon transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Single checklist item ──────────────────────────────────────────────────

const ChecklistItemRow = ({
  item,
  onComplete,
  onDismiss,
  isCompleting,
  isDismissing,
}: {
  item: OnboardingChecklistItem;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  isCompleting: boolean;
  isDismissing: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        item.is_completed
          ? 'border-green-200 bg-green-50/50'
          : item.is_dismissed
            ? 'border-carbon/10 bg-carbon/5 opacity-50'
            : 'border-carbon/15 bg-white hover:border-azure-dragon/30'
      }`}
    >
      {/* Checkbox / status icon */}
      <button
        onClick={() => !item.is_completed && !item.is_dismissed && onComplete(item.id)}
        disabled={item.is_completed || item.is_dismissed || isCompleting}
        className="mt-0.5 flex-shrink-0"
      >
        {item.is_completed ? (
          <MdCheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <MdRadioButtonUnchecked className="h-6 w-6 text-carbon/30 hover:text-azure-dragon" />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4
          className={`text-sm font-medium ${
            item.is_completed ? 'text-green-700 line-through' : item.is_dismissed ? 'text-carbon/40 line-through' : 'text-carbon/90'
          }`}
        >
          {item.title}
        </h4>
        {item.description && (
          <p className="mt-0.5 text-xs text-carbon/50">{item.description}</p>
        )}
        {item.is_completed && item.completed_at && (
          <p className="mt-1 text-xs text-green-600">
            Completed {new Date(item.completed_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {item.action_url && !item.is_completed && !item.is_dismissed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(item.action_url!)}
          >
            Go <MdOpenInNew className="ml-1 h-3 w-3" />
          </Button>
        )}

        {!item.is_completed && !item.is_dismissed && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete(item.id)}
              disabled={isCompleting}
            >
              {isCompleting ? <Loading size="sm" /> : t(ONBOARDING.CHECKLIST_ITEM_COMPLETE)}
            </Button>
            <button
              onClick={() => onDismiss(item.id)}
              disabled={isDismissing}
              className="rounded p-1.5 text-carbon/40 hover:bg-carbon/10 hover:text-carbon/60"
              title={t(ONBOARDING.CHECKLIST_ITEM_DISMISS)}
            >
              <MdClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main ChecklistPage ─────────────────────────────────────────────────────

export const ChecklistPage = () => {
  const { t } = useTranslation();
  const toast = useToastStore();
  const { user } = useAuth();
  const clinicId = user?.clinic_id || user?.employee?.clinic_id || '';

  const { data: items, isLoading, error } = useOnboardingChecklist(clinicId);
  const completeMutation = useCompleteChecklistItem();
  const dismissMutation = useDismissChecklistItem();

  // Group items by a derived category (using key prefix or role)
  const { activeItems, dismissedItems, completedCount, totalActive } = useMemo(() => {
    if (!items) return { activeItems: [], dismissedItems: [], completedCount: 0, totalActive: 0 };

    const active: OnboardingChecklistItem[] = [];
    const dismissed: OnboardingChecklistItem[] = [];

    for (const item of items) {
      if (item.is_dismissed) {
        dismissed.push(item);
      } else {
        active.push(item);
      }
    }

    // Sort by sort_order, then completed to bottom
    active.sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return a.sort_order - b.sort_order;
    });

    dismissed.sort((a, b) => a.sort_order - b.sort_order);

    const completed = active.filter((i) => i.is_completed).length;

    return {
      activeItems: active,
      dismissedItems: dismissed,
      completedCount: completed,
      totalActive: active.length,
    };
  }, [items]);

  const handleComplete = async (itemId: string) => {
    try {
      await completeMutation.mutateAsync(itemId);
      toast.success(t(ONBOARDING.STEP_COMPLETED));
    } catch {
      toast.error('Failed to complete item');
    }
  };

  const handleDismiss = async (itemId: string) => {
    try {
      await dismissMutation.mutateAsync(itemId);
      toast.info('Item dismissed');
    } catch {
      toast.error('Failed to dismiss item');
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-3">
          <p className="text-sm text-smudged-lips">Failed to load checklist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-azure-dragon/10">
          <MdChecklist className="h-5 w-5 text-azure-dragon" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon">
            {t(ONBOARDING.CHECKLIST)}
          </h1>
          <p className="text-sm text-carbon/60">Complete these tasks to get the most out of H360</p>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar completed={completedCount} total={totalActive} />

      {/* All-done banner */}
      {totalActive > 0 && completedCount === totalActive && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <MdCheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="text-sm font-semibold text-green-700">All tasks completed!</p>
          <p className="text-xs text-green-600">Your clinic is fully set up.</p>
        </div>
      )}

      {/* Active items */}
      {activeItems.length > 0 ? (
        <div className="space-y-3">
          {activeItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onComplete={handleComplete}
              onDismiss={handleDismiss}
              isCompleting={completeMutation.isPending}
              isDismissing={dismissMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <MdChecklist className="mb-4 h-12 w-12 text-carbon/20" />
            <p className="text-sm text-carbon/50">No checklist items yet</p>
          </CardContent>
        </Card>
      )}

      {/* Dismissed items */}
      {dismissedItems.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium text-carbon/40">Dismissed Items</h3>
          <div className="space-y-2">
            {dismissedItems.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onComplete={handleComplete}
                onDismiss={handleDismiss}
                isCompleting={completeMutation.isPending}
                isDismissing={dismissMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
