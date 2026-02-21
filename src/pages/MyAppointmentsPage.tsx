import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { MdEvent, MdInfo } from 'react-icons/md';

export const MyAppointmentsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
            {t(APPOINTMENT.MY_APPOINTMENTS)}
          </h1>
          <p className="text-body text-carbon/60 font-ui">
            {t(APPOINTMENT.VIEW_MANAGE_APPOINTMENTS)}
          </p>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdEvent className="h-5 w-5 text-azure-dragon" />
              {t(APPOINTMENT.APPOINTMENTS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MdInfo className="h-12 w-12 text-carbon/30 mb-4" />
              <h3 className="text-h3 text-carbon font-heading font-medium mb-2">
                {t(APPOINTMENT.NO_APPOINTMENTS)}
              </h3>
              <p className="text-body text-carbon/60 font-ui max-w-md">
                {t(APPOINTMENT.NO_APPOINTMENTS_DESC)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
