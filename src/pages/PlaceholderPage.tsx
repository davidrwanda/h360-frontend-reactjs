import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="mx-auto max-w-7xl">
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body text-carbon/70">
          This module will be implemented in a future week. See roadmap for details.
        </p>
      </CardContent>
    </Card>
  </div>
);
