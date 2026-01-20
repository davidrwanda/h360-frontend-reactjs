import { Patient } from '@/api/patients';
import { Button } from '@/components/ui';
import { MdEdit, MdDelete, MdPerson, MdVisibility, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface PatientsTableProps {
  patients: Patient[];
  isLoading?: boolean;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onActivate?: (patient: Patient) => void;
}

export const PatientsTable = ({
  patients,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onActivate,
}: PatientsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <MdPerson className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">No patients found</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender?: string) => {
    if (!gender) return '—';
    const genderMap: Record<string, string> = {
      M: 'Male',
      F: 'Female',
      Other: 'Other',
    };
    return genderMap[gender] || gender;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Patient Number</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Name</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Email</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Phone</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Date of Birth</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Gender</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.patient_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <div className="text-sm font-medium text-carbon">
                  {patient.patient_number || '—'}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdPerson className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">
                    {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{patient.email || '—'}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{patient.phone || '—'}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{formatDate(patient.date_of_birth)}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{formatGender(patient.gender)}</div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    patient.is_active !== false
                      ? 'bg-bright-halo/20 text-azure-dragon'
                      : 'bg-carbon/10 text-carbon/60'
                  )}
                >
                  {patient.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {patient.is_active !== false ? (
                    <>
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(patient)}
                          className="h-8 w-8 p-0"
                          title="View details"
                        >
                          <MdVisibility className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(patient)}
                          className="h-8 w-8 p-0"
                          title="Edit patient"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(patient)}
                          className="h-8 w-8 p-0 text-smudged-lips hover:text-smudged-lips"
                          title="Deactivate patient"
                        >
                          <MdDelete className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(patient)}
                          className="h-8 w-8 p-0"
                          title="View details"
                        >
                          <MdVisibility className="h-4 w-4" />
                        </Button>
                      )}
                      {onActivate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActivate(patient)}
                          className="h-8 w-8 p-0 text-azure-dragon hover:text-azure-dragon"
                          title="Activate patient"
                        >
                          <MdCheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
