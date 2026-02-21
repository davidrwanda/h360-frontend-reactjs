import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { EditPatientForm } from '@/components/patients';
import { Loading, Button } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';
import { useTranslation, PATIENT } from '@/i18n';

export const EditPatientPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: patientId } = useParams<{ id: string }>();
  const { data: patient, isLoading } = usePatient(patientId);

  const handleSuccess = () => {
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(PATIENT.INVALID_PATIENT)}</h1>
          <p className="text-body text-carbon/70 mb-4">
            {t(PATIENT.PATIENT_ID_MISSING)}
          </p>
          <Button variant="outline" onClick={() => navigate('/patients')}>
            {t(PATIENT.BACK_TO_PATIENTS)}
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(PATIENT.PATIENT_NOT_FOUND)}</h1>
          <p className="text-body text-carbon/70 mb-4">
            {t(PATIENT.PATIENT_NOT_EXISTS)}
          </p>
          <Button variant="outline" onClick={() => navigate('/patients')}>
            {t(PATIENT.BACK_TO_PATIENTS)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patients')}
          className="h-8 w-8 p-0"
        >
          <MdArrowBack className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(PATIENT.EDIT_PATIENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(PATIENT.UPDATE_INFO)}
          </p>
        </div>
      </div>

      <EditPatientForm
        patientId={patientId}
        patient={patient}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
