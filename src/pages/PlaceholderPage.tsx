import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useTranslation, COMMON } from '@/i18n';

interface PlaceholderPageProps {
  titleKey: string;
}

export const PlaceholderPage = ({ titleKey }: PlaceholderPageProps) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(titleKey)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body text-carbon/70">
            {t(COMMON.PLACEHOLDER_MODULE_DESC)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
