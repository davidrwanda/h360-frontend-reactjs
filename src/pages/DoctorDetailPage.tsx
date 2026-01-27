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

const DoctorDetailPage = () => {
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
              Failed to load doctor. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctors')}
              className="mt-4"
            >
              Back to Doctors
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
          Back to Doctors
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              Doctor Details
            </h1>
            <p className="text-sm text-carbon/60">
              View doctor information and profile
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
                Timetable
              </Button>
            )}
            {canEdit && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/doctors/${doctor.doctor_id}/edit`)}
              >
                <MdEdit className="h-4 w-4 mr-2" />
                Edit My Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-carbon/60 mb-1 block">Full Name</label>
              <p className="text-sm text-carbon flex items-center gap-2">
                <MdPerson className="h-4 w-4" />
                {doctor.full_name}
              </p>
            </div>

            {doctor.doctor_number && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Doctor Number</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdBadge className="h-4 w-4" />
                  {doctor.doctor_number}
                </p>
              </div>
            )}

            {doctor.email && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Email</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdEmail className="h-4 w-4" />
                  {doctor.email}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-carbon/60 mb-1 block">Phone</label>
              <p className="text-sm text-carbon flex items-center gap-2">
                <MdPhone className="h-4 w-4" />
                {doctor.phone}
              </p>
            </div>

            {doctor.gender && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Gender</label>
                <p className="text-sm text-carbon">
                  {doctor.gender === 'M' ? 'Male' : doctor.gender === 'F' ? 'Female' : 'Other'}
                </p>
              </div>
            )}

            {doctor.age !== null && doctor.age !== undefined && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Age</label>
                <p className="text-sm text-carbon">{doctor.age} years</p>
              </div>
            )}

            {doctor.specialty && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Specialty</label>
                <p className="text-sm text-carbon">{doctor.specialty}</p>
              </div>
            )}

            {doctor.sub_specialty && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Sub-Specialty</label>
                <p className="text-sm text-carbon">{doctor.sub_specialty}</p>
              </div>
            )}

            {doctor.alternate_phone && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Alternate Phone</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdPhone className="h-4 w-4" />
                  {doctor.alternate_phone}
                </p>
              </div>
            )}

            {doctor.date_of_birth && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Date of Birth</label>
                <p className="text-sm text-carbon">
                  {format(new Date(doctor.date_of_birth), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            {doctor.license_number && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">License Number</label>
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
                      {doctor.is_license_expired ? 'Expired' : 'Valid'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {doctor.license_expiry_date && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">License Expiry Date</label>
                <p className="text-sm text-carbon">
                  {format(new Date(doctor.license_expiry_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            {doctor.medical_school && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Medical School</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdSchool className="h-4 w-4" />
                  {doctor.medical_school}
                </p>
              </div>
            )}

            {doctor.years_of_experience !== undefined && doctor.years_of_experience !== null && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Years of Experience</label>
                <p className="text-sm text-carbon flex items-center gap-2">
                  <MdWork className="h-4 w-4" />
                  {doctor.years_of_experience} years
                </p>
              </div>
            )}

            {doctor.qualifications && (
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1 block">Qualifications</label>
                <p className="text-sm text-carbon">{doctor.qualifications}</p>
              </div>
            )}
          </div>

          {doctor.bio && (
            <div className="pt-4 border-t border-carbon/10">
              <label className="text-xs font-medium text-carbon/60 mb-1 block">Bio</label>
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
              Clinic Associations
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
                          <span className="text-xs text-azure-dragon ml-2">(Primary)</span>
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
                        <span className="font-medium">Hire Date: </span>
                        {format(new Date(relationship.hire_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {relationship.max_daily_patients && (
                      <div>
                        <span className="font-medium">Max Daily Patients: </span>
                        {relationship.max_daily_patients}
                      </div>
                    )}
                    {relationship.appointment_duration_minutes && (
                      <div>
                        <span className="font-medium">Appointment Duration: </span>
                        {relationship.appointment_duration_minutes} minutes
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Accepts New Patients: </span>
                      {relationship.accepts_new_patients ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Status: </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1',
                          relationship.is_active
                            ? 'bg-bright-halo/20 text-azure-dragon'
                            : 'bg-carbon/10 text-carbon/60'
                        )}
                      >
                        {relationship.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {relationship.consultation_fee && (
                      <div>
                        <span className="font-medium">Consultation Fee: </span>
                        {relationship.consultation_fee}
                      </div>
                    )}
                    {relationship.notes && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Notes: </span>
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
              Assigned Services
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
                        <span className="font-medium">Price: </span>
                        {service.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <MdAccessTime className="h-3 w-3" />
                        <span className="font-medium">Duration: </span>
                        {service.duration_minutes} minutes
                      </div>
                      {service.category && (
                        <div>
                          <span className="font-medium">Category: </span>
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
              <p>No services assigned to this doctor.</p>
              {canManageServices && (
                <p className="text-xs mt-1">Click "Assign Service" to add one.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={!!serviceToRemove}
        onClose={() => setServiceToRemove(null)}
        onConfirm={handleRemoveService}
        title="Remove Service Assignment"
        message={`Are you sure you want to remove "${serviceToRemove?.serviceName}" from this doctor?`}
        confirmText="Remove"
        isLoading={removeServiceMutation.isPending}
      />
    </div>
  );
};

export default DoctorDetailPage;
