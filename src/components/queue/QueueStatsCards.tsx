import { StatCard } from '@/components/dashboard/StatCard';
import { useQueueStats } from '@/hooks/useQueue';
import { useTranslation, QUEUE } from '@/i18n';
import { MdQueue, MdCheckCircle, MdPlayArrow, MdDone } from 'react-icons/md';

interface QueueStatsCardsProps {
  doctorId: string;
}

export const QueueStatsCards = ({ doctorId }: QueueStatsCardsProps) => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQueueStats(doctorId);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t(QUEUE.TOTAL_IN_QUEUE)}
        value={stats?.total_in_queue ?? '—'}
        icon={<MdQueue className="h-6 w-6" />}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t(QUEUE.CHECKED_IN_COUNT)}
        value={stats?.checked_in ?? '—'}
        icon={<MdCheckCircle className="h-6 w-6" />}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t(QUEUE.IN_PROGRESS_COUNT)}
        value={stats?.in_progress ?? '—'}
        icon={<MdPlayArrow className="h-6 w-6" />}
        variant="warning"
        loading={isLoading}
      />
      <StatCard
        title={t(QUEUE.COMPLETED_TODAY)}
        value={stats?.completed_today ?? '—'}
        icon={<MdDone className="h-6 w-6" />}
        variant="success"
        loading={isLoading}
      />
    </div>
  );
};
