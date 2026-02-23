import { User } from '@/api/users';
import { Button } from '@/components/ui';
import { MdEdit, MdDelete, MdPerson, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';
import { useTranslation, USERS } from '@/i18n';

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

  if (admins.length === 0) {
    return (
      <div className="text-center py-12">
        <MdPerson className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">
          {clinicName ? t(USERS.NO_ADMINS_FOUND_FOR, { clinicName }) : t(USERS.NO_CLINIC_ADMINS_FOUND)}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_NAME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_EMAIL)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_USERNAME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_PHONE)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_DEPARTMENT)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_STATUS)}</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">{t(USERS.TH_ACTIONS)}</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr
              key={admin.user_id}
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
                  {admin.is_active ? t(USERS.ACTIVE) : t(USERS.INACTIVE)}
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
                          aria-label={t(USERS.EDIT_ADMIN)}
                          title={t(USERS.EDIT_ADMIN)}
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
                          aria-label={t(USERS.DEACTIVATE_ADMIN)}
                          title={t(USERS.DEACTIVATE_ADMIN)}
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
                        aria-label={t(USERS.ACTIVATE_ADMIN)}
                        title={t(USERS.ACTIVATE_ADMIN)}
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
