import { Doctor } from '@/api/doctors';
import { Button } from '@/components/ui';
import { useTranslation, DOCTOR } from '@/i18n';
import { MdEdit, MdDelete, MdVisibility, MdLocalHospital, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface DoctorsTableProps {
  doctors: Doctor[];
  isLoading?: boolean;
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (doctor: Doctor) => void;
  onActivate?: (doctor: Doctor) => void;
  onView?: (doctor: Doctor) => void;
  canEdit?: boolean; // Only Admin, Manager can edit
}

export const DoctorsTable = ({
  doctors,
  isLoading = false,
  onEdit,
  onDelete,
  onActivate,
  onView,
  canEdit = false,
}: DoctorsTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <MdLocalHospital className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">{t(DOCTOR.NO_DOCTORS_FOUND)}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.DOCTOR_NUMBER)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.NAME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.SPECIALTY)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.PHONE)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.CLINIC)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.STATUS)}</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">{t(DOCTOR.ACTIONS)}</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr
              key={doctor.doctor_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-carbon">
                  {doctor.doctor_number || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdLocalHospital className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">{doctor.full_name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {doctor.specialty || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">{doctor.phone}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {doctor.clinic_name || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    doctor.is_active
                      ? 'bg-bright-halo/20 text-azure-dragon'
                      : 'bg-carbon/10 text-carbon/60'
                  )}
                >
                  {doctor.is_active ? t(DOCTOR.ACTIVE) : t(DOCTOR.INACTIVE)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(doctor)}
                      className="h-8 w-8 p-0"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Button>
                  )}
                  {doctor.is_active ? (
                    <>
                      {canEdit && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(doctor)}
                          className="h-8 w-8 p-0"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(doctor)}
                          className="h-8 w-8 p-0 text-smudged-lips hover:text-smudged-lips"
                        >
                          <MdDelete className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    canEdit && onActivate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onActivate(doctor)}
                        className="h-8 w-8 p-0 text-azure-dragon hover:text-azure-dragon"
                        title={t(DOCTOR.ACTIVATE_DOCTOR_TOOLTIP)}
                      >
                        <MdCheckCircle className="h-4 w-4" />
                      </Button>
                    )
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
