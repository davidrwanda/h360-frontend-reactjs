import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctors';
import { useDoctorServices, useRemoveDoctorFromService } from '@/hooks/useServices';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading, DeleteConfirmationModal } from '@/components/ui';
import { AssignServiceForm } from '@/components/doctors/AssignServiceForm';
import { MdArrowBack, MdEdit, MdLocalHospital, MdEmail, MdPhone, MdBusiness, MdBadge, MdPerson, MdSchool, MdWork, MdVerified, MdMedicalServices, MdDelete, MdAccessTime, MdAttachMoney, MdSchedule } from 'react-icons/md';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation, DOCTOR } from '@/i18n';

const DoctorDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [serviceToRemove, setServiceToRemove] = useState<{ serviceId: string; serviceName: string } | null>(null);

  const { data: doctor, isLoading, error } = useDoctor(id!, !!id);
  const { data: assignedServices, refetch: refetchServices } = useDoctorServices(id!, !!id);
  const removeServiceMutation = useRemoveDoctorFromService();

  // Only doctors can edit their own profile
  const normalizedRole = role?.toUpperCase();
  const isDoctor = normalizedRole === 'DOCTOR';
  const isOwnProfile = isDoctor && user?.user_id === doctor?.user_id;
  const canEdit = isOwnProfile; // Only doctors can edit their own info
  
  // Check if user can manage service assignments (Admin, Manager)
  const canManageServices = normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';
  // Check if user can manage doctor calendar (Admin, Manager)
  const canManageCalendar = normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';

  const handleRemoveService = async () => {
    if (!serviceToRemove) return;
    
    try {
      await removeServiceMutation.mutateAsync({
        serviceId: serviceToRemove.serviceId,
        doctorId: id!,
      });
      setServiceToRemove(null);
      refetchServices();
    } catch (error) {
      console.error('Failed to remove service:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Loading />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-smudged-lips">
              {t(DOCTOR.FAILED_TO_LOAD)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctors')}
              className="mt-4"
            >
              {t(DOCTOR.BACK_TO_DOCTORS)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              {t(DOCTOR.DOCTOR_DETAILS)}
            </h1>
            <p className="text-sm text-carbon/60">
              {t(DOCTOR.VIEW_DOCTOR_INFO)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManageCalendar && (
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/doctors/${doctor.doctor_id}/timetable`)}
              >
                <MdSchedule className="h-4 w-4 mr-2" />
                {t(DOCTOR.TIMETABLE)}
              </Button>
            )}
            {canEdit && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/doctors/${doctor.doctor_id}/edit`)}
              >
                <MdEdit className="h-4 w-4 mr-2" />
                {t(DOCTOR.EDIT_MY_PROFILE)}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            {t(DOCTOR.BASIC_INFORMATION)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.FULL_NAME)}</label>
              <p className="text-sm text-carbon flex items-center gap-2">
                <MdPerson className="h-4 w-4" />
                {doctor.full_name}
              </p>
            </div>

            {doctor.doctor_number && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.DOCTOR_NUMBER)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdBadge className="h-4 w-4" />
                  {doctor.doctor_number}
                </p>
              </div>
            )}

            {doctor.email && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.EMAIL)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdEmail className="h-4 w-4" />
                  {doctor.email}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.PHONE)}</label>
              <p className="text-sm text-carbon flex items-center gap-2">
                <MdPhone className="h-4 w-4" />
                {doctor.phone}
              </p>
            </div>

            {doctor.gender && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.GENDER)}</label>
                <p className="text-sm text-carbon">
                  {doctor.gender === 'M' ? t(DOCTOR.MALE) : doctor.gender === 'F' ? t(DOCTOR.FEMALE) : t(DOCTOR.OTHER_GENDER)}
                </p>
              </div>
            )}

            {doctor.age !== null && doctor.age !== undefined && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.AGE)}</label>
                <p className="text-sm text-carbon">{t(DOCTOR.AGE_YEARS, { age: doctor.age })}</p>
              </div>
            )}

            {doctor.specialty && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.SPECIALTY)}</label>
                <p className="text-sm text-carbon">{doctor.specialty}</p>
              </div>
            )}

            {doctor.alternate_phone && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.ALTERNATE_PHONE)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdPhone className="h-4 w-4" />
                  {doctor.alternate_phone}
                </p>
              </div>
            )}

            {doctor.date_of_birth && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.DATE_OF_BIRTH)}</label>
                <p className="text-sm text-carbon">
                  {format(new Date(doctor.date_of_birth), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            {doctor.license_number && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.LICENSE_NUMBER)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdVerified className="h-4 w-4" />
                  {doctor.license_number}
                  {doctor.is_license_expired !== undefined && (
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2',
                        doctor.is_license_expired
                          ? 'bg-smudged-lips/20 text-smudged-lips'
                          : 'bg-bright-halo/20 text-azure-dragon'
                      )}
                    >
                      {doctor.is_license_expired ? t(DOCTOR.LICENSE_EXPIRED) : t(DOCTOR.LICENSE_VALID)}
                    </span>
                  )}
                </p>
              </div>
            )}

            {doctor.license_expiry_date && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.LICENSE_EXPIRY_DATE)}</label>
                <p className="text-sm text-carbon">
                  {format(new Date(doctor.license_expiry_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            {doctor.medical_school && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.MEDICAL_SCHOOL)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdSchool className="h-4 w-4" />
                  {doctor.medical_school}
                </p>
              </div>
            )}

            {doctor.years_of_experience !== undefined && doctor.years_of_experience !== null && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.YEARS_OF_EXPERIENCE)}</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdWork className="h-4 w-4" />
                  {t(DOCTOR.EXPERIENCE_YEARS, { years: doctor.years_of_experience })}
                </p>
              </div>
            )}

            {doctor.qualifications && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.QUALIFICATIONS)}</label>
                <p className="text-sm text-carbon">{doctor.qualifications}</p>
              </div>
            )}
          </div>

          {doctor.bio && (
            <div className="pt-4 border-t border-carbon/10">
              <label className="text-xs font-medium text-carbon/60 mb-1 block">{t(DOCTOR.BIO)}</label>
              <p className="text-sm text-carbon/70">{doctor.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinic Relationships */}
      {doctor.clinic_relationships && doctor.clinic_relationships.length > 0 && (
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-5 w-5 text-azure-dragon" />
              {t(DOCTOR.CLINIC_ASSOCIATIONS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctor.clinic_relationships.map((relationship) => (
                <div
                  key={relationship.doctor_clinic_id}
                  className="rounded-md border border-carbon/10 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdBusiness className="h-4 w-4 text-azure-dragon" />
                      <span className="text-sm font-medium text-carbon">
                        {relationship.clinic_name}
                        {relationship.clinic_id === doctor.clinic_id && (
                          <span className="text-xs text-azure-dragon ml-2">({t(DOCTOR.PRIMARY)})</span>
                        )}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        relationship.employment_status === 'active'
                          ? 'bg-bright-halo/20 text-azure-dragon'
                          : 'bg-carbon/10 text-carbon/60'
                      )}
                    >
                      {relationship.employment_status}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
                    {relationship.hire_date && (
                      <div>
                        <span className="font-medium">{t(DOCTOR.HIRE_DATE)}: </span>
                        {format(new Date(relationship.hire_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {relationship.max_daily_patients && (
                      <div>
                        <span className="font-medium">{t(DOCTOR.MAX_DAILY_PATIENTS)}: </span>
                        {relationship.max_daily_patients}
                      </div>
                    )}
                    {relationship.appointment_duration_minutes && (
                      <div>
                        <span className="font-medium">{t(DOCTOR.APPOINTMENT_DURATION)}: </span>
                        {t(DOCTOR.DURATION_MINUTES, { minutes: relationship.appointment_duration_minutes })}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">{t(DOCTOR.ACCEPTS_NEW_PATIENTS)}: </span>
                      {relationship.accepts_new_patients ? t(DOCTOR.YES) : t(DOCTOR.NO)}
                    </div>
                    <div>
                      <span className="font-medium">{t(DOCTOR.STATUS)}: </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1',
                          relationship.is_active
                            ? 'bg-bright-halo/20 text-azure-dragon'
                            : 'bg-carbon/10 text-carbon/60'
                        )}
                      >
                        {relationship.is_active ? t(DOCTOR.ACTIVE) : t(DOCTOR.INACTIVE)}
                      </span>
                    </div>
                    {relationship.consultation_fee && (
                      <div>
                        <span className="font-medium">{t(DOCTOR.CONSULTATION_FEE)}: </span>
                        {relationship.consultation_fee}
                      </div>
                    )}
                    {relationship.notes && (
                      <div className="md:col-span-2">
                        <span className="font-medium">{t(DOCTOR.NOTES)}: </span>
                        <span className="text-carbon/60">{relationship.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Services Section */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdMedicalServices className="h-5 w-5 text-azure-dragon" />
              {t(DOCTOR.ASSIGNED_SERVICES)}
            </CardTitle>
            {canManageServices && doctor && (
              <AssignServiceForm
                doctorId={doctor.doctor_id}
                onSuccess={() => {
                  refetchServices();
                }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {assignedServices && assignedServices.length > 0 ? (
            <div className="space-y-3">
              {assignedServices.map((service) => (
                <div
                  key={service.service_id}
                  className="rounded-md border border-carbon/10 p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MdMedicalServices className="h-4 w-4 text-azure-dragon" />
                      <span className="text-sm font-medium text-carbon">
                        {service.name}
                      </span>
                      {service.service_code && (
                        <span className="text-xs text-carbon/60">
                          ({service.service_code})
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2 md:grid-cols-3 text-xs text-carbon/70 ml-6">
                      <div className="flex items-center gap-1">
                        <MdAttachMoney className="h-3 w-3" />
                        <span className="font-medium">{t(DOCTOR.PRICE)}: </span>
                        {service.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <MdAccessTime className="h-3 w-3" />
                        <span className="font-medium">{t(DOCTOR.DURATION)}: </span>
                        {t(DOCTOR.DURATION_MINUTES, { minutes: service.duration_minutes })}
                      </div>
                      {service.category && (
                        <div>
                          <span className="font-medium">{t(DOCTOR.CATEGORY)}: </span>
                          {service.category}
                        </div>
                      )}
                    </div>
                  </div>
                  {canManageServices && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setServiceToRemove({
                          serviceId: service.service_id,
                          serviceName: service.name,
                        })
                      }
                      className="text-smudged-lips hover:text-smudged-lips hover:bg-smudged-lips/10"
                    >
                      <MdDelete className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-carbon/60">
              <MdMedicalServices className="h-8 w-8 mx-auto mb-2 text-carbon/30" />
              <p>{t(DOCTOR.NO_SERVICES_ASSIGNED)}</p>
              {canManageServices && (
                <p className="text-xs mt-1">{t(DOCTOR.CLICK_ASSIGN_SERVICE)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={!!serviceToRemove}
        onClose={() => setServiceToRemove(null)}
        onConfirm={handleRemoveService}
        title={t(DOCTOR.REMOVE_SERVICE_TITLE)}
        message={t(DOCTOR.REMOVE_SERVICE_MESSAGE, { serviceName: serviceToRemove?.serviceName ?? '' })}
        confirmText={t(DOCTOR.REMOVE)}
        isLoading={removeServiceMutation.isPending}
      />
    </div>
  );
};

export default DoctorDetailPage;
