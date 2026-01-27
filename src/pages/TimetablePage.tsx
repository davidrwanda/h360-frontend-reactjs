import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { MdSchedule, MdBusiness, MdPerson, MdPlayArrow } from 'react-icons/md';

/**
 * Timetable hub page – clinic and doctor schedules, slot generation.
 * For clinic managers (MANAGER role).
 */
export const TimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getClinicIdFromStorage = (): string | undefined => {
    try {
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch {
      // ignore
    }
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  const clinicId = getClinicIdFromStorage();

  if (!clinicId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">No Clinic Assigned</h2>
          <p className="text-sm text-carbon/60">
            You are not assigned to any clinic. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Timetable
        </h1>
        <p className="text-sm text-carbon/60">
          Manage clinic and doctor schedules, and generate appointment slots.
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            Timetable Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/clinic-calendar')}
              className="justify-start h-auto py-4 hover:bg-white cursor-pointer"
            >
              <MdBusiness className="h-5 w-5 mr-3 text-azure-dragon flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-carbon">Clinic Timetable</div>
                <div className="text-xs text-carbon/60 mt-0.5">Configure clinic operating hours by day</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/doctor-calendar')}
              className="justify-start h-auto py-4 hover:bg-white cursor-pointer"
            >
              <MdPerson className="h-5 w-5 mr-3 text-azure-dragon flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-carbon">Doctor Timetable</div>
                <div className="text-xs text-carbon/60 mt-0.5">Manage doctor availability Monday–Sunday</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/slot-generation')}
              className="justify-start h-auto py-4 hover:bg-white cursor-pointer"
            >
              <MdPlayArrow className="h-5 w-5 mr-3 text-azure-dragon flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-carbon">Slot Generation</div>
                <div className="text-xs text-carbon/60 mt-0.5">Generate or regenerate appointment slots</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
