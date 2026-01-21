import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdEvent, MdInfo } from 'react-icons/md';

export const MyAppointmentsPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
            My Appointments
          </h1>
          <p className="text-body text-carbon/60 font-ui">
            View and manage your appointments
          </p>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdEvent className="h-5 w-5 text-azure-dragon" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MdInfo className="h-12 w-12 text-carbon/30 mb-4" />
              <h3 className="text-h3 text-carbon font-heading font-medium mb-2">
                No Appointments Yet
              </h3>
              <p className="text-body text-carbon/60 font-ui max-w-md">
                You don't have any appointments scheduled. Appointments will appear here once they are booked.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
