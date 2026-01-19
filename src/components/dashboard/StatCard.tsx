import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: 'border-carbon/10',
    primary: 'border-azure-dragon/20 bg-azure-dragon/5',
    success: 'border-bright-halo/20 bg-bright-halo/5',
    warning: 'border-bright-halo/30 bg-bright-halo/10',
    danger: 'border-smudged-lips/20 bg-smudged-lips/5',
  };

  return (
    <Card variant="elevated" className={cn(variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-carbon/60 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-carbon/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-heading font-semibold text-carbon">{value}</p>
            )}
            {trend && !loading && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-bright-halo' : 'text-smudged-lips'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-carbon/50">{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 text-azure-dragon opacity-60">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
