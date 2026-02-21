import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CreateDoctorForm } from '@/components/doctors/CreateDoctorForm';
import { useTranslation, DOCTOR } from '@/i18n';
import { Button } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';
const CreateDoctorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get clinic_id from user object (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id;

  return (
    <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/doctors')}
            className="mb-4"
          >
            <MdArrowBack className="h-4 w-4 mr-2" />
            {t(DOCTOR.BACK_TO_DOCTORS)}
          </Button>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DOCTOR.CREATE_DOCTOR)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(DOCTOR.CREATE_DESCRIPTION)}
          </p>
        </div>

        <CreateDoctorForm
          clinicId={clinicId}
          onSuccess={() => navigate('/doctors')}
          onCancel={() => navigate('/doctors')}
        />
      </div>
  );
};

export default CreateDoctorPage;
