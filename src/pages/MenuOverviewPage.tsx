import { useAuth } from '@/hooks/useAuth';
import { getFilteredNavigation } from '@/config/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export const MenuOverviewPage = () => {
  const { user, role } = useAuth();
  const navigationItems = getFilteredNavigation(role, user?.user_type);

  const menuSections = [
    {
      title: 'Main',
      items: navigationItems.filter((item) =>
        ['dashboard'].includes(item.id)
      ),
    },
    {
      title: 'People & Services',
      items: navigationItems.filter((item) =>
        ['patients', 'doctors', 'services'].includes(item.id)
      ),
    },
    {
      title: 'Operations',
      items: navigationItems.filter((item) =>
        ['appointments', 'queue'].includes(item.id)
      ),
    },
    {
      title: 'Administration',
      items: navigationItems.filter((item) =>
        ['clinics', 'employees'].includes(item.id)
      ),
    },
    {
      title: 'System',
      items: navigationItems.filter((item) =>
        ['notifications', 'activity-logs', 'settings'].includes(item.id)
      ),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          Navigation Menu Overview
        </h1>
        <p className="text-sm text-carbon/60">
          Complete menu structure for your role: <span className="font-medium capitalize">
            {role || user?.user_type || 'N/A'}
          </span>
          {user?.permissions && (
            <span className="ml-2 text-xs text-carbon/50">
              ({user.permissions === 'ALL' ? 'Full Access' : user.permissions})
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuSections.map((section, index) => (
          <Card key={index} variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-carbon/80 hover:bg-white-smoke transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4 text-azure-dragon flex-shrink-0" />}
                      <span className="font-medium">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">All Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {navigationItems
              .filter((item) => !item.id.startsWith('divider'))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-carbon/70 border border-carbon/10"
                  >
                    {Icon && <Icon className="h-4 w-4 text-azure-dragon" />}
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto text-xs text-carbon/50">{item.path}</span>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
