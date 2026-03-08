import { useNavigate } from 'react-router-dom';
import { useApiKeys, useWebhooks } from '@/hooks/useIntegrations';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Loading } from '@/components/ui';
import { MdVpnKey, MdWebhook } from 'react-icons/md';

export const IntegrationsPage = () => {
  const navigate = useNavigate();

  const { data: apiKeysData, isLoading: apiKeysLoading } = useApiKeys({ is_active: true, limit: 1 });
  const { data: webhooksData, isLoading: webhooksLoading } = useWebhooks({ is_active: true, limit: 1 });

  const activeKeysCount = apiKeysData?.total ?? 0;
  const activeWebhooksCount = webhooksData?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Integrations
        </h1>
        <p className="text-sm text-carbon/60">
          Manage API keys and webhooks to integrate external systems with H360.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* API Keys Card */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure-dragon/10">
                <MdVpnKey className="h-5 w-5 text-azure-dragon" />
              </div>
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Authenticate external applications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/70 mb-4">
              Create and manage API keys to allow third-party systems to securely access H360 data.
              Each key can be scoped with specific permissions and expiration dates.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                {apiKeysLoading ? (
                  <Loading size="sm" />
                ) : (
                  <span>{activeKeysCount} active key{activeKeysCount !== 1 ? 's' : ''}</span>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/integrations/api-keys')}
              >
                Manage API Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks Card */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure-dragon/10">
                <MdWebhook className="h-5 w-5 text-azure-dragon" />
              </div>
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Real-time event notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/70 mb-4">
              Configure webhooks to receive real-time notifications when events occur in H360,
              such as appointment updates, patient registrations, and more.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                {webhooksLoading ? (
                  <Loading size="sm" />
                ) : (
                  <span>{activeWebhooksCount} active webhook{activeWebhooksCount !== 1 ? 's' : ''}</span>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/integrations/webhooks')}
              >
                Manage Webhooks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>How Integrations Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-carbon mb-2">API Keys</h3>
              <ul className="space-y-2 text-sm text-carbon/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Generate API keys with fine-grained permissions (read/write per resource).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Include the key in the <code className="rounded bg-carbon/5 px-1 py-0.5 font-mono text-xs">Authorization</code> header of API requests.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Rotate keys periodically and revoke compromised keys immediately.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-carbon mb-2">Webhooks</h3>
              <ul className="space-y-2 text-sm text-carbon/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Register HTTPS endpoints to receive event payloads in real time.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Each delivery is signed with your webhook secret for verification.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-azure-dragon" />
                  Failed deliveries are retried automatically with exponential backoff.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
