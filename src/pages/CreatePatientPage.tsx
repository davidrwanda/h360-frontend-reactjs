import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClinic, useClinics } from '@/hooks/useClinics';
import { CreatePatientForm } from '@/components/patients';
import { Loading, Button, Select } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation, PATIENT } from '@/i18n';

export const CreatePatientPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role } = useAuth();
  const { t } = useTranslation();

  // Get clinic_id from URL params or user's clinic_id for clinic-level users
  const clinicIdFromUrl = searchParams.get('clinic_id');
  const isSystemAdmin = user?.user_type === 'SYSTEM' || role?.toUpperCase() === 'ADMIN';
  // clinic_id can be on the user object directly, or nested in employee/employee_profile
  const userClinicId = user?.clinic_id || user?.employee?.clinic_id || user?.employee_profile?.clinic_id || undefined;
  const initialClinicId = clinicIdFromUrl || (!isSystemAdmin && userClinicId ? userClinicId : undefined);

  // For system admins without a pre-selected clinic, allow inline selection
  const [selectedClinicId, setSelectedClinicId] = useState<string>(initialClinicId || '');
  const clinicId = initialClinicId || selectedClinicId || undefined;

  const { data: clinic, isLoading } = useClinic(clinicId || undefined);
  const { data: clinicsData } = useClinics({ limit: 100, is_active: true });
  const clinics = clinicsData?.data || [];

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
            {t(PATIENT.CREATE_PATIENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {clinic
              ? t(PATIENT.ADD_PATIENT_FOR, { clinicName: clinic.name })
              : t(PATIENT.ADD_NEW_PATIENT)}
          </p>
        </div>
      </div>

      {/* Clinic selector for system admins when no clinic pre-selected */}
      {!initialClinicId && (
        <div className="mb-6">
          <Select
            label={t(PATIENT.SELECT_CLINIC)}
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
            required
            options={[
              { value: '', label: t(PATIENT.SELECT_CLINIC) },
              ...clinics.map((c) => ({ value: c.clinic_id, label: c.name })),
            ]}
          />
        </div>
      )}

      {clinicId ? (
        <CreatePatientForm
          clinicId={clinicId}
          clinicName={clinic?.name}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <div className="text-center py-12 text-carbon/50 text-sm">
          {t(PATIENT.CLINIC_ID_MISSING)}
        </div>
      )}
    </div>
  );
};
