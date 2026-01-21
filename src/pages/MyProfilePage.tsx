import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePatient } from '@/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';
import { MdAccountCircle, MdEmail, MdPhone, MdCalendarToday, MdPerson, MdInfo, MdBusiness, MdBadge, MdEdit, MdClose } from 'react-icons/md';

const editPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

export const MyProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdatePatient();
  const { success: showSuccess, error: showError } = useToastStore();
  
  // Get patient data from user object (from /api/auth/me)
  const patient = user?.patient;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  // Update form when patient data loads
  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relationship: patient.emergency_contact_relationship || '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: EditPatientFormData) => {
    if (!patient?.patient_id) return;
    
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: patient.patient_id,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postal_code: data.postal_code || undefined,
          country: data.country || undefined,
          emergency_contact_name: data.emergency_contact_name || undefined,
          emergency_contact_phone: data.emergency_contact_phone || undefined,
          emergency_contact_relationship: data.emergency_contact_relationship || undefined,
        },
      });
      
      // Invalidate auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
              My Profile
            </h1>
            <p className="text-body text-carbon/60 font-ui">
              View and manage your personal information
            </p>
          </div>
          {patient && !isEditing && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
            >
              <MdEdit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MdAccountCircle className="h-5 w-5 text-azure-dragon" />
                Personal Information
              </CardTitle>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                    setError(null);
                  }}
                >
                  <MdClose className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                      <p className="text-xs text-smudged-lips">{error}</p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Patient Number - Read Only */}
                    {patient.patient_number && (
                      <div>
                        <label className="block text-xs font-medium text-carbon/60 mb-1.5">
                          Patient Number
                        </label>
                        <p className="text-sm text-carbon font-ui font-medium bg-white-smoke px-3 py-2 rounded-md">
                          {patient.patient_number}
                        </p>
                        <p className="text-xs text-carbon/50 mt-1">Cannot be changed</p>
                      </div>
                    )}

                    <Input
                      label="First Name"
                      {...register('first_name')}
                      error={errors.first_name?.message}
                      required
                    />

                    <Input
                      label="Last Name"
                      {...register('last_name')}
                      error={errors.last_name?.message}
                      required
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      {...register('date_of_birth')}
                      error={errors.date_of_birth?.message}
                    />

                    <Input
                      label="Address"
                      {...register('address')}
                      error={errors.address?.message}
                    />

                    <Input
                      label="City"
                      {...register('city')}
                      error={errors.city?.message}
                    />

                    <Input
                      label="State/Province"
                      {...register('state')}
                      error={errors.state?.message}
                    />

                    <Input
                      label="Postal Code"
                      {...register('postal_code')}
                      error={errors.postal_code?.message}
                    />

                    <Input
                      label="Country"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="pt-4 border-t border-carbon/10">
                    <h3 className="text-sm font-medium text-carbon mb-4">Emergency Contact</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Emergency Contact Name"
                        {...register('emergency_contact_name')}
                        error={errors.emergency_contact_name?.message}
                      />

                      <Input
                        label="Emergency Contact Phone"
                        type="tel"
                        {...register('emergency_contact_phone')}
                        error={errors.emergency_contact_phone?.message}
                      />

                      <Input
                        label="Relationship"
                        {...register('emergency_contact_relationship')}
                        error={errors.emergency_contact_relationship?.message}
                        placeholder="e.g., Spouse, Parent, Sibling"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-carbon/10">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {patient.patient_number && (
                      <div className="flex items-start gap-3">
                        <MdBadge className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">Patient Number</p>
                          <p className="text-sm text-carbon font-ui font-medium">
                            {patient.patient_number}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-carbon/60 mb-1">Full Name</p>
                        <p className="text-sm text-carbon font-ui">
                          {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                        </p>
                      </div>
                    </div>

                    {patient.date_of_birth && (
                      <div className="flex items-start gap-3">
                        <MdCalendarToday className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">Date of Birth</p>
                          <p className="text-sm text-carbon font-ui">
                            {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.age !== undefined && patient.age > 0 && (
                      <div className="flex items-start gap-3">
                        <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">Age</p>
                          <p className="text-sm text-carbon font-ui">{patient.age} years</p>
                        </div>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="flex items-start gap-3">
                        <MdPhone className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">Phone</p>
                          <p className="text-sm text-carbon font-ui">{patient.phone}</p>
                        </div>
                      </div>
                    )}

                    {patient.address && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MdInfo className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-carbon/60 mb-1">Address</p>
                          <p className="text-sm text-carbon font-ui">
                            {patient.address}
                            {patient.city && `, ${patient.city}`}
                            {patient.state && `, ${patient.state}`}
                            {patient.postal_code && ` ${patient.postal_code}`}
                            {patient.country && `, ${patient.country}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.emergency_contact_name && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">Emergency Contact</p>
                          <p className="text-sm text-carbon font-ui">
                            {patient.emergency_contact_name}
                            {patient.emergency_contact_phone && ` - ${patient.emergency_contact_phone}`}
                            {patient.emergency_contact_relationship && ` (${patient.emergency_contact_relationship})`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Clinics Section */}
                {patient.clinics && patient.clinics.length > 0 && (
                  <div className="pt-4 border-t border-carbon/10">
                    <p className="text-xs font-medium text-carbon/60 mb-3">Subscribed Clinics</p>
                    <div className="space-y-2">
                      {patient.clinics.map((clinic) => (
                        <div
                          key={clinic.clinic_id}
                          className="flex items-center justify-between p-3 rounded-md bg-white-smoke"
                        >
                          <div className="flex items-center gap-2">
                            <MdBusiness className="h-4 w-4 text-azure-dragon" />
                            <span className="text-sm font-medium text-carbon">{clinic.clinic_name}</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              clinic.subscription_status === 'active'
                                ? 'bg-bright-halo/20 text-azure-dragon'
                                : 'bg-carbon/10 text-carbon/60'
                            }`}
                          >
                            {clinic.subscription_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-body text-carbon/60 font-ui">
                  Profile information will be displayed here once your patient record is linked to your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAccountCircle className="h-5 w-5 text-azure-dragon" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <MdEmail className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">Email</p>
                  <p className="text-sm text-carbon font-ui">{user?.email || 'N/A'}</p>
                  <p className="text-xs text-carbon/50 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {user?.username && (
                <div className="flex items-start gap-3">
                  <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-carbon/60 mb-1">Username</p>
                    <p className="text-sm text-carbon font-ui">{user.username}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MdInfo className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">Account Status</p>
                  <p className="text-sm text-carbon font-ui">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-carbon/10">
              <p className="text-xs text-carbon/60">
                To change your password, please visit{' '}
                <a href="/settings" className="text-azure-dragon hover:underline">
                  Settings
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
