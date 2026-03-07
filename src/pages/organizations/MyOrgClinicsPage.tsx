import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, useAddClinicToOrganization, useRemoveClinicFromOrganization } from '@/hooks/useOrganizations';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading, Input, Modal } from '@/components/ui';
import { MdBusiness, MdAdd, MdDelete, MdArrowBack } from 'react-icons/md';

export const MyOrgClinicsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastStore();

  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  const { data: org, isLoading, error } = useOrganization(orgId);
  const addClinicMutation = useAddClinicToOrganization();
  const removeClinicMutation = useRemoveClinicFromOrganization();

  const [clinicIdInput, setClinicIdInput] = useState('');
  const [clinicToRemove, setClinicToRemove] = useState<{ id: string; name: string } | null>(null);

  const handleAddClinic = async () => {
    if (!orgId || !clinicIdInput.trim()) return;
    try {
      await addClinicMutation.mutateAsync({ orgId, clinicId: clinicIdInput.trim() });
      showSuccess(t(ORGANIZATION.CLINIC_ADDED));
      setClinicIdInput('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg);
    }
  };

  const handleRemoveClinic = async () => {
    if (!orgId || !clinicToRemove) return;
    try {
      await removeClinicMutation.mutateAsync({ orgId, clinicId: clinicToRemove.id });
      showSuccess(t(ORGANIZATION.CLINIC_REMOVED));
      setClinicToRemove(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-3">
          <p className="text-sm text-smudged-lips">{t(ORGANIZATION.FAILED_LOAD)}</p>
        </div>
      </div>
    );
  }

  const clinics = org.clinics || [];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-organization')}>
            <MdArrowBack className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon">
              {t(ORGANIZATION.ORG_CLINICS)}
            </h1>
            <p className="text-sm text-carbon/60">{t(ORGANIZATION.ORG_CLINICS_DESC)}</p>
          </div>
        </div>
      </div>

      {/* Add Clinic Section */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle>{t(ORGANIZATION.ADD_CLINIC_BY_ID)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label={t(ORGANIZATION.CLINIC_NAME)}
                value={clinicIdInput}
                onChange={(e) => setClinicIdInput(e.target.value)}
                placeholder={t(ORGANIZATION.CLINIC_ID_PLACEHOLDER)}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddClinic}
              disabled={!clinicIdInput.trim() || addClinicMutation.isPending}
            >
              <MdAdd className="h-4 w-4 mr-2" />
              {t(ORGANIZATION.ADD_CLINIC)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clinics List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(ORGANIZATION.ORG_CLINICS)} ({clinics.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clinics.length > 0 ? (
            <div className="space-y-2">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between rounded-md border border-carbon/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <MdBusiness className="h-4 w-4 text-carbon/40" />
                    <span className="text-sm font-medium text-carbon">{clinic.facility_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {clinic.plan_name && (
                      <span className="text-xs text-carbon/50">{clinic.plan_name}</span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        clinic.is_active
                          ? 'bg-verdant/10 text-verdant'
                          : 'bg-smudged-lips/10 text-smudged-lips'
                      }`}
                    >
                      {clinic.is_active ? t(COMMON.ACTIVE) : t(COMMON.INACTIVE)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setClinicToRemove({ id: clinic.id, name: clinic.facility_name })}
                    >
                      <MdDelete className="h-4 w-4 text-smudged-lips" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MdBusiness className="h-10 w-10 text-carbon/20 mx-auto mb-2" />
              <p className="text-sm text-carbon/60 mb-1">{t(ORGANIZATION.NO_CLINICS)}</p>
              <p className="text-xs text-carbon/40">{t(ORGANIZATION.NO_CLINICS_HINT)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Modal */}
      {clinicToRemove && (
        <Modal
          isOpen={!!clinicToRemove}
          onClose={() => setClinicToRemove(null)}
          title={t(ORGANIZATION.CONFIRM_REMOVE_CLINIC)}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/60">
              {t(ORGANIZATION.CONFIRM_REMOVE_CLINIC_MSG)}{' '}
              <span className="font-medium text-carbon">{clinicToRemove.name}</span>
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setClinicToRemove(null)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="danger"
                onClick={handleRemoveClinic}
                disabled={removeClinicMutation.isPending}
              >
                <MdDelete className="h-3.5 w-3.5 mr-1.5" />
                {t(ORGANIZATION.REMOVE_CLINIC)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
