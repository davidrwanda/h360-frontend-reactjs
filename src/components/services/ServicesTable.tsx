import { Service } from '@/api/services';
import { Button } from '@/components/ui';
import { MdEdit, MdDelete, MdVisibility, MdMedicalServices, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface ServicesTableProps {
  services: Service[];
  isLoading?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onActivate?: (service: Service) => void;
  onView?: (service: Service) => void;
  canEdit?: boolean; // Only managers can edit
}

export const ServicesTable = ({
  services,
  isLoading = false,
  onEdit,
  onDelete,
  onActivate,
  onView,
  canEdit = false,
}: ServicesTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <MdMedicalServices className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">No services found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Service Code</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Name</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Category</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Price</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Duration</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.service_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-carbon">{service.service_code}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdMedicalServices className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">{service.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {service.category || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-carbon">{service.price}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">{service.duration_minutes} min</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    service.is_active
                      ? 'bg-bright-halo/20 text-azure-dragon'
                      : 'bg-carbon/10 text-carbon/60'
                  )}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(service)}
                      className="h-8 w-8 p-0"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Button>
                  )}
                  {service.is_active ? (
                    <>
                      {canEdit && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(service)}
                          className="h-8 w-8 p-0"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(service)}
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
                        onClick={() => onActivate(service)}
                        className="h-8 w-8 p-0 text-azure-dragon hover:text-azure-dragon"
                        title="Activate service"
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
