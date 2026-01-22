import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctor } from '@/hooks/useDoctors';
import { EditDoctorForm } from '@/components/doctors/EditDoctorForm';
import { EditDoctorClinicForm } from '@/components/doctors/EditDoctorClinicForm';
import { Button, Card, CardContent, Loading } from '@/components/ui';
import { MdArrowBack, MdBusiness } from 'react-icons/md';

const EditDoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);

  const { data: doctor, isLoading, error, refetch } = useDoctor(id!, !!id);

  // Only doctors can edit their own profile
  const normalizedRole = role?.toUpperCase();
  const isDoctor = normalizedRole === 'DOCTOR';
  const isOwnProfile = isDoctor && user?.user_id === doctor?.user_id;
  
  // Check if user can edit clinic relationships (Admin, Manager, Receptionist)
  const canEditClinicRelationships = 
    normalizedRole === 'ADMIN' || 
    normalizedRole === 'MANAGER' || 
    normalizedRole === 'RECEPTIONIST';
  
  if (!isLoading && doctor && !isOwnProfile && !canEditClinicRelationships) {
    // Redirect if not own profile and not authorized
    navigate(`/doctors/${id}`);
    return null;
  }

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

  const handleClinicEditSuccess = () => {
    setEditingClinicId(null);
    refetch();
  };

  const activeRelationship = doctor.clinic_relationships?.find(
    (rel) => rel.clinic_id === editingClinicId && rel.is_active
  );

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
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Edit Doctor
        </h1>
        <p className="text-sm text-carbon/60">
          Update doctor information and preferences.
        </p>
      </div>

      {/* Edit Doctor Profile (only for own profile - doctors editing themselves) */}
      {isOwnProfile && !canEditClinicRelationships && (
        <div className="mb-6">
          <EditDoctorForm
            doctor={doctor}
            onSuccess={() => {
              refetch();
            }}
            onCancel={() => navigate('/doctors')}
          />
        </div>
      )}

      {/* Edit Clinic Relationships (for Admin, Manager, Receptionist - only clinic-level editing) */}
      {canEditClinicRelationships && doctor.clinic_relationships && doctor.clinic_relationships.length > 0 && (
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-heading font-semibold text-azure-dragon mb-1 flex items-center gap-2">
              <MdBusiness className="h-5 w-5" />
              Clinic Relationships
            </h2>
            <p className="text-sm text-carbon/60">
              Edit clinic-specific settings for this doctor.
            </p>
          </div>

          {editingClinicId && activeRelationship ? (
            <EditDoctorClinicForm
              doctorId={doctor.doctor_id}
              relationship={activeRelationship}
              onSuccess={handleClinicEditSuccess}
              onCancel={() => setEditingClinicId(null)}
            />
          ) : (
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {doctor.clinic_relationships
                    .filter((rel) => rel.is_active)
                    .map((relationship) => (
                      <div
                        key={relationship.doctor_clinic_id}
                        className="rounded-md border border-carbon/10 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MdBusiness className="h-4 w-4 text-azure-dragon" />
                            <span className="text-sm font-medium text-carbon">
                              {relationship.clinic_name}
                              {relationship.clinic_id === doctor.clinic_id && (
                                <span className="text-xs text-azure-dragon ml-2">(Primary)</span>
                              )}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingClinicId(relationship.clinic_id)}
                          >
                            Edit Clinic Settings
                          </Button>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
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
                          {relationship.consultation_fee && (
                            <div>
                              <span className="font-medium">Consultation Fee: </span>
                              {relationship.consultation_fee}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Accepts New Patients: </span>
                            {relationship.accepts_new_patients ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EditDoctorPage;
