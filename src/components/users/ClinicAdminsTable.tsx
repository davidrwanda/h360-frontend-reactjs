import { User } from '@/api/users';
import { Button } from '@/components/ui';
import { MdEdit, MdDelete, MdPerson, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface ClinicAdminsTableProps {
  admins: User[];
  isLoading?: boolean;
  onEdit?: (admin: User) => void;
  onDelete?: (admin: User) => void;
  onActivate?: (admin: User) => void;
  clinicName?: string;
}

export const ClinicAdminsTable = ({
  admins,
  isLoading = false,
  onEdit,
  onDelete,
  onActivate,
  clinicName,
}: ClinicAdminsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="text-center py-12">
        <MdPerson className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">
          {clinicName ? `No admins found for ${clinicName}` : 'No clinic admins found'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Name</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Email</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Username</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Phone</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Department</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr
              key={admin.employee_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdPerson className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">
                    {admin.first_name} {admin.last_name}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{admin.email}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{admin.username}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{admin.phone || '—'}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{admin.department || '—'}</div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    admin.is_active
                      ? 'bg-bright-halo/20 text-azure-dragon'
                      : 'bg-carbon/10 text-carbon/60'
                  )}
                >
                  {admin.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {admin.is_active ? (
                    <>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(admin)}
                          className="h-8 w-8 p-0"
                          aria-label="Edit admin"
                          title="Edit admin"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(admin)}
                          className="h-8 w-8 p-0 text-smudged-lips hover:text-smudged-lips"
                          aria-label="Deactivate admin"
                          title="Deactivate admin"
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
                        onClick={() => onActivate(admin)}
                        className="h-8 w-8 p-0 text-azure-dragon hover:text-azure-dragon-dark"
                        aria-label="Activate admin"
                        title="Activate admin"
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
