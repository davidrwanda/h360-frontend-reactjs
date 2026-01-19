import { Clinic } from '@/api/clinics';
import { Button } from '@/components/ui';
import { MdEdit, MdDelete, MdVisibility, MdBusiness, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface ClinicsTableProps {
  clinics: Clinic[];
  isLoading?: boolean;
  onEdit?: (clinic: Clinic) => void;
  onDelete?: (clinic: Clinic) => void;
  onView?: (clinic: Clinic) => void;
  onActivate?: (clinic: Clinic) => void;
}

export const ClinicsTable = ({
  clinics,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onActivate,
}: ClinicsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="text-center py-12">
        <MdBusiness className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">No clinics found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Name</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Location</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Contact</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clinics.map((clinic) => (
            <tr
              key={clinic.clinic_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdBusiness className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">{clinic.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">
                  {clinic.city && clinic.state ? (
                    <>
                      {clinic.city}, {clinic.state}
                    </>
                  ) : clinic.address ? (
                    <span className="truncate max-w-[200px] block">{clinic.address}</span>
                  ) : (
                    <span className="text-carbon/40">—</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">
                  {clinic.phone || clinic.email ? (
                    <>
                      {clinic.phone && <div>{clinic.phone}</div>}
                      {clinic.email && (
                        <div className="text-xs text-carbon/50 truncate max-w-[200px]">
                          {clinic.email}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-carbon/40">—</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    clinic.is_active
                      ? 'bg-bright-halo/20 text-azure-dragon'
                      : 'bg-carbon/10 text-carbon/60'
                  )}
                >
                  {clinic.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(clinic)}
                      className="h-8 w-8 p-0"
                      aria-label="View clinic"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Button>
                  )}
                  {clinic.is_active ? (
                    <>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(clinic)}
                          className="h-8 w-8 p-0"
                          aria-label="Edit clinic"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(clinic)}
                          className="h-8 w-8 p-0 text-smudged-lips hover:text-smudged-lips"
                          aria-label="Delete clinic"
                        >
                          <MdDelete className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    onActivate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onActivate(clinic)}
                        className="h-8 w-8 p-0 text-azure-dragon hover:text-azure-dragon"
                        aria-label="Activate clinic"
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
