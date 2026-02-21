import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useService, useServiceDoctors } from '@/hooks/useServices';
import { useTranslation, SERVICE } from '@/i18n';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading } from '@/components/ui';
import { MdEdit, MdArrowBack, MdMedicalServices, MdPerson, MdAccessTime, MdBusiness } from 'react-icons/md';

export const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const { t } = useTranslation();
  const { data: service, isLoading } = useService(id || '', !!id);
  const { data: doctors } = useServiceDoctors(id || '', !!id);

  const normalizedRole = role?.toUpperCase();
  const canEdit = normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(SERVICE.SERVICE_NOT_FOUND)}</h1>
          <p className="text-body text-carbon/70">
            {t(SERVICE.SERVICE_NOT_FOUND_DESC)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/services')}
          >
            <MdArrowBack className="h-4 w-4 mr-2" />
            {t(SERVICE.BACK)}
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              {service.name}
            </h1>
            <p className="text-sm text-carbon/60">
              {t(SERVICE.SERVICE_DETAILS)}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/services/${service.service_id}/edit`)}
          >
            <MdEdit className="h-4 w-4 mr-2" />
            {t(SERVICE.EDIT_SERVICE)}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Service Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdMedicalServices className="h-5 w-5 text-azure-dragon" />
              {t(SERVICE.SERVICE_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <MdMedicalServices className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.SERVICE_CODE)}</p>
                  <p className="text-sm text-carbon font-ui font-medium">{service.service_code}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdBusiness className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.CLINIC)}</p>
                  <p className="text-sm text-carbon font-ui">{service.clinic_name || 'N/A'}</p>
                </div>
              </div>

              {service.category && (
                <div className="flex items-start gap-3">
                  <MdMedicalServices className="h-5 w-5 text-carbon/40 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.CATEGORY)}</p>
                    <p className="text-sm text-carbon font-ui">{service.category}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MdMedicalServices className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.PRICE)}</p>
                  <p className="text-sm text-carbon font-ui font-medium">{service.price}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdAccessTime className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.DURATION)}</p>
                  <p className="text-sm text-carbon font-ui">{t(SERVICE.DURATION_MIN, { minutes: String(service.duration_minutes) })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdMedicalServices className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.STATUS)}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      service.is_active
                        ? 'bg-bright-halo/20 text-azure-dragon'
                        : 'bg-carbon/10 text-carbon/60'
                    }`}
                  >
                    {service.is_active ? t(SERVICE.ACTIVE) : t(SERVICE.INACTIVE)}
                  </span>
                </div>
              </div>

              {service.max_daily_capacity && (
                <div className="flex items-start gap-3">
                  <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.MAX_DAILY_CAPACITY)}</p>
                    <p className="text-sm text-carbon font-ui">{service.max_daily_capacity}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MdMedicalServices className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(SERVICE.APPOINTMENT_TYPE)}</p>
                  <p className="text-sm text-carbon font-ui">
                    {service.requires_appointment ? t(SERVICE.REQUIRES_APPOINTMENT_LABEL) : t(SERVICE.WALK_IN_AVAILABLE)}
                  </p>
                </div>
              </div>
            </div>

            {service.description && (
              <div className="mt-4 pt-4 border-t border-carbon/10">
                <p className="text-xs font-medium text-carbon/60 mb-2">{t(SERVICE.DESCRIPTION)}</p>
                <p className="text-sm text-carbon font-ui">{service.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Doctors */}
        {doctors && doctors.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdPerson className="h-5 w-5 text-azure-dragon" />
                {t(SERVICE.ASSIGNED_DOCTORS)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctors.map((assignment) => (
                  <div
                    key={assignment.doctor_service_id}
                    className="flex items-center justify-between p-3 rounded-md bg-white-smoke"
                  >
                    <div>
                      <p className="text-sm font-medium text-carbon">
                        {assignment.doctor_name || t(SERVICE.UNKNOWN_DOCTOR)}
                      </p>
                      {assignment.custom_price && (
                        <p className="text-xs text-carbon/60 mt-1">
                          {t(SERVICE.CUSTOM_PRICE)}: {assignment.custom_price}
                        </p>
                      )}
                      {assignment.custom_duration_minutes && (
                        <p className="text-xs text-carbon/60">
                          {t(SERVICE.CUSTOM_DURATION)}: {t(SERVICE.DURATION_MIN, { minutes: String(assignment.custom_duration_minutes) })}
                        </p>
                      )}
                      {assignment.notes && (
                        <p className="text-xs text-carbon/60 mt-1">{assignment.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
