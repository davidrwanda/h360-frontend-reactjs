import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClinicContextStore } from '@/store/clinicContextStore';
import type { UserMembership, ClinicMembership } from '@/types/auth';
import { MdBusiness, MdLocalHospital, MdArrowForward, MdChevronRight } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface WorkspaceSelectorDashboardProps {
  memberships: UserMembership[];
}

export const WorkspaceSelectorDashboard = ({ memberships }: WorkspaceSelectorDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setActiveClinic } = useClinicContextStore();

  const firstName = user?.first_name || user?.username || user?.email?.split('@')[0] || '';
  const multiOrg = memberships.length > 1;

  const handleSelect = (cm: ClinicMembership) => {
    const normalizedRole = cm.role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    if (normalizedRole === 'ORG_OWNER') {
      navigate('/my-organization');
      return;
    }

    // Save selected clinic — persisted until logout or manual switch
    setActiveClinic(cm.clinic_id, cm.clinic_name);
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-carbon/60">
          {multiOrg
            ? 'You belong to multiple organizations. Select a workspace to continue.'
            : 'You have access to multiple clinics. Select one to continue.'}
        </p>
      </div>

      <div className="space-y-4">
        {memberships.map((org) => {
          const activeClinicMemberships = org.memberships.filter((m) => m.status === 'active');

          // Single clinic in this org — render as a single card
          if (activeClinicMemberships.length === 1) {
            const cm = activeClinicMemberships[0]!;
            const normalizedRole = cm.role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
            const isOwner = normalizedRole === 'ORG_OWNER';

            return (
              <button
                key={org.organization_id}
                onClick={() => handleSelect(cm)}
                className={cn(
                  'w-full text-left rounded-xl border bg-white p-4 transition-all group',
                  'hover:border-azure-dragon/40 hover:shadow-md border-carbon/10 shadow-sm'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                      isOwner ? 'bg-azure-dragon/10' : 'bg-verdant/10'
                    )}>
                      <MdBusiness className={cn('h-5 w-5', isOwner ? 'text-azure-dragon' : 'text-verdant')} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-carbon truncate">{org.organization_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={cn(
                          'text-xs font-medium px-1.5 py-0.5 rounded-full',
                          isOwner ? 'bg-azure-dragon/10 text-azure-dragon' : 'bg-carbon/10 text-carbon/60'
                        )}>
                          {cm.role}
                        </span>
                        {cm.clinic_name && (
                          <span className="flex items-center gap-1 text-xs text-carbon/50">
                            <MdLocalHospital className="h-3 w-3" />
                            {cm.clinic_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <MdArrowForward className="h-5 w-5 text-carbon/30 flex-shrink-0 group-hover:text-azure-dragon transition-colors" />
                </div>
              </button>
            );
          }

          // Multiple clinics in this org — org header with expandable clinic list
          return (
            <div key={org.organization_id} className="rounded-xl border border-carbon/10 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-carbon/8">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-azure-dragon/10">
                  <MdBusiness className="h-5 w-5 text-azure-dragon" />
                </div>
                <div>
                  <p className="font-medium text-carbon text-sm">{org.organization_name}</p>
                  <p className="text-xs text-carbon/50">{activeClinicMemberships.length} clinics</p>
                </div>
              </div>
              <div className="divide-y divide-carbon/5">
                {activeClinicMemberships.map((cm) => {
                  const normalizedRole = cm.role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
                  const isOwner = normalizedRole === 'ORG_OWNER';
                  return (
                    <button
                      key={cm.membership_id ?? cm.clinic_id}
                      onClick={() => handleSelect(cm)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-carbon/3 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MdLocalHospital className="h-4 w-4 flex-shrink-0 text-carbon/40" />
                        <div className="min-w-0">
                          <p className="text-sm text-carbon truncate">{cm.clinic_name ?? cm.clinic_id}</p>
                          <span className={cn(
                            'text-xs font-medium px-1.5 py-0.5 rounded-full',
                            isOwner ? 'bg-azure-dragon/10 text-azure-dragon' : 'bg-carbon/10 text-carbon/60'
                          )}>
                            {cm.role}
                          </span>
                        </div>
                      </div>
                      <MdChevronRight className="h-4 w-4 text-carbon/30 flex-shrink-0 group-hover:text-azure-dragon transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
