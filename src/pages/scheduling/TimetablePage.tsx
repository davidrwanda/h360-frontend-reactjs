import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { MdSchedule, MdBusiness, MdPerson, MdPlayArrow } from 'react-icons/md';
import { useTranslation, TIMETABLE } from '@/i18n';

/**
 * Timetable hub page – clinic and doctor schedules, slot generation.
 * For clinic managers (MANAGER role).
 */
export const TimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(TIMETABLE.NO_CLINIC_ASSIGNED)}</h2>
          <p className="text-sm text-carbon/60">
            {t(TIMETABLE.CONTACT_ADMIN)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(TIMETABLE.TIMETABLE)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(TIMETABLE.MANAGE_SCHEDULES)}
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            {t(TIMETABLE.TIMETABLE_CONFIGURATION)}
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
                <div className="font-medium text-carbon">{t(TIMETABLE.CLINIC_TIMETABLE)}</div>
                <div className="text-xs text-carbon/60 mt-0.5">{t(TIMETABLE.CLINIC_TIMETABLE_DESC)}</div>
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
                <div className="font-medium text-carbon">{t(TIMETABLE.DOCTOR_TIMETABLE)}</div>
                <div className="text-xs text-carbon/60 mt-0.5">{t(TIMETABLE.DOCTOR_TIMETABLE_DESC)}</div>
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
                <div className="font-medium text-carbon">{t(TIMETABLE.SLOT_GENERATION)}</div>
                <div className="text-xs text-carbon/60 mt-0.5">{t(TIMETABLE.SLOT_GENERATION_DESC)}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
