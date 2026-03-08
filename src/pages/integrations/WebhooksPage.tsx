import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookDeliveries,
} from '@/hooks/useIntegrations';
import { useToastStore } from '@/store/toastStore';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  Loading,
  DeleteConfirmationModal,
} from '@/components/ui';
import {
  MdWebhook,
  MdAdd,
  MdEdit,
  MdDelete,
  MdContentCopy,
  MdArrowBack,
  MdSend,
  MdCheck,
  MdClose,
  MdWarning,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import type {
  WebhookSubscription,
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from '@/types/integrations';

// ─── Webhook event options ───────────────────────────────────────────────────

const WEBHOOK_EVENTS = [
  { value: 'appointment.created', label: 'Appointment Created' },
  { value: 'appointment.updated', label: 'Appointment Updated' },
  { value: 'appointment.canceled', label: 'Appointment Canceled' },
  { value: 'appointment.completed', label: 'Appointment Completed' },
  { value: 'patient.created', label: 'Patient Created' },
  { value: 'patient.updated', label: 'Patient Updated' },
  { value: 'doctor.created', label: 'Doctor Created' },
  { value: 'service.created', label: 'Service Created' },
  { value: 'queue.updated', label: 'Queue Updated' },
  { value: 'slot.generated', label: 'Slots Generated' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncateUrl = (url: string, maxLen = 45) => {
  if (url.length <= maxLen) return url;
  return url.substring(0, maxLen) + '...';
};

// ─── Page Component ──────────────────────────────────────────────────────────

export const WebhooksPage = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();

  // State
  const [page, setPage] = useState(1);
  const limit = 20;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookSubscription | null>(null);
  const [deletingWebhook, setDeletingWebhook] = useState<WebhookSubscription | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showFullSecret, setShowFullSecret] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [deliveriesWebhookId, setDeliveriesWebhookId] = useState<string | null>(null);

  // Create form state
  const [createUrl, setCreateUrl] = useState('');
  const [createEvents, setCreateEvents] = useState<string[]>([]);
  const [createDescription, setCreateDescription] = useState('');

  // Edit form state
  const [editUrl, setEditUrl] = useState('');
  const [editEvents, setEditEvents] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Hooks
  const { data: webhooksData, isLoading } = useWebhooks({ page, limit });
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();
  const { data: deliveriesData, isLoading: deliveriesLoading } = useWebhookDeliveries(
    deliveriesWebhookId ?? '',
    { limit: 20 },
    { enabled: !!deliveriesWebhookId }
  );

  const webhooks = webhooksData?.data ?? [];
  const total = webhooksData?.total ?? 0;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCopySecret = async (secret: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      showSuccess('Webhook secret copied to clipboard');
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      showError('Failed to copy secret to clipboard');
    }
  };

  const resetCreateForm = () => {
    setCreateUrl('');
    setCreateEvents([]);
    setCreateDescription('');
  };

  const handleCreate = async () => {
    if (!createUrl.trim()) {
      showError('Please enter a URL');
      return;
    }
    if (!createUrl.startsWith('https://')) {
      showError('URL must start with https://');
      return;
    }
    if (createEvents.length === 0) {
      showError('Please select at least one event');
      return;
    }

    try {
      const payload: CreateWebhookRequest = {
        url: createUrl.trim(),
        events: createEvents,
        description: createDescription.trim() || undefined,
      };

      const result = await createMutation.mutateAsync(payload);
      setShowCreateModal(false);
      resetCreateForm();

      if (result?.secret) {
        setCreatedSecret(result.secret);
      } else {
        showSuccess('Webhook created successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook';
      showError(message);
    }
  };

  const openEditModal = (webhook: WebhookSubscription) => {
    setEditingWebhook(webhook);
    setEditUrl(webhook.url);
    setEditEvents([...webhook.events]);
    setEditDescription(webhook.description ?? '');
    setEditIsActive(webhook.is_active);
  };

  const handleUpdate = async () => {
    if (!editingWebhook) return;
    if (!editUrl.trim()) {
      showError('Please enter a URL');
      return;
    }
    if (!editUrl.startsWith('https://')) {
      showError('URL must start with https://');
      return;
    }

    try {
      const payload: UpdateWebhookRequest = {
        url: editUrl.trim(),
        events: editEvents,
        description: editDescription.trim() || undefined,
        is_active: editIsActive,
      };
      await updateMutation.mutateAsync({ id: editingWebhook.subscription_id, data: payload });
      setEditingWebhook(null);
      showSuccess('Webhook updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook';
      showError(message);
    }
  };

  const handleDelete = async () => {
    if (!deletingWebhook) return;
    try {
      await deleteMutation.mutateAsync(deletingWebhook.subscription_id);
      setDeletingWebhook(null);
      showSuccess('Webhook deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook';
      showError(message);
    }
  };

  const handleTest = async (webhookId: string) => {
    setTestingWebhookId(webhookId);
    try {
      await testMutation.mutateAsync(webhookId);
      showSuccess('Test event sent successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send test event';
      showError(message);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const toggleCreateEvent = (event: string) => {
    setCreateEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const toggleEditEvent = (event: string) => {
    setEditEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/integrations')}
            className="h-8 w-8 p-0"
          >
            <MdArrowBack className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              Webhooks
            </h1>
            <p className="text-sm text-carbon/60">
              Configure webhook endpoints to receive real-time event notifications.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            Webhooks ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12">
              <Loading size="lg" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="py-12 text-center">
              <MdWebhook className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60 mb-2">No webhooks yet</p>
              <p className="text-xs text-carbon/40">
                Create your first webhook to start receiving event notifications.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-carbon/10">
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">URL</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Events</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Status</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Failures</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Last Triggered</th>
                      <th className="px-3 py-3 text-right font-medium text-carbon/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map((webhook) => (
                      <tr
                        key={webhook.subscription_id}
                        className="border-b border-carbon/5 hover:bg-carbon/2"
                      >
                        <td className="px-3 py-3">
                          <code className="text-xs font-mono text-carbon/70" title={webhook.url}>
                            {truncateUrl(webhook.url)}
                          </code>
                          {webhook.description && (
                            <p className="text-xs text-carbon/50 mt-0.5">{webhook.description}</p>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full bg-azure-dragon/10 px-2 py-0.5 text-xs text-azure-dragon">
                            {webhook.events.length} event{webhook.events.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              webhook.is_active
                                ? 'bg-verdant/10 text-verdant'
                                : 'bg-smudged-lips/10 text-smudged-lips'
                            }`}
                          >
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-sm font-medium ${
                              webhook.failure_count > 0
                                ? 'text-smudged-lips'
                                : 'text-carbon/60'
                            }`}
                          >
                            {webhook.failure_count}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-carbon/60">
                          {formatDateTime(webhook.last_triggered_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(webhook)}
                              className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-azure-dragon transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleTest(webhook.subscription_id)}
                              disabled={testingWebhookId === webhook.subscription_id}
                              className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-azure-dragon transition-colors disabled:opacity-50"
                              title="Send test event"
                            >
                              <MdSend className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeliveriesWebhookId(webhook.subscription_id)}
                              className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-azure-dragon transition-colors"
                              title="View deliveries"
                            >
                              <MdVisibility className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingWebhook(webhook)}
                              className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-smudged-lips transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-carbon/60">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} webhooks
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Create Modal ─────────────────────────────────────────────────── */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetCreateForm();
          }}
          title="Create Webhook"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="URL (HTTPS required)"
              placeholder="https://example.com/webhooks/h360"
              value={createUrl}
              onChange={(e) => setCreateUrl(e.target.value)}
            />

            <Input
              label="Description (optional)"
              placeholder="e.g., Production notification endpoint"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">
                Events
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((evt) => (
                  <label
                    key={evt.value}
                    className="flex items-center gap-2 rounded-md border border-carbon/10 p-2 cursor-pointer hover:bg-carbon/2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={createEvents.includes(evt.value)}
                      onChange={() => toggleCreateEvent(evt.value)}
                      className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{evt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-carbon/10">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Webhook'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Created Secret Display Modal ─────────────────────────────────── */}
      {createdSecret && (
        <Modal
          isOpen={!!createdSecret}
          onClose={() => {
            setCreatedSecret(null);
            setCopiedSecret(false);
            setShowFullSecret(false);
          }}
          title="Webhook Created"
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <MdWarning className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Save this signing secret now - you will not be able to see it again!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Use this secret to verify that webhook payloads are coming from H360.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-1">
                Signing Secret
              </label>
              <div className="flex items-center gap-2 rounded-md bg-carbon/5 border border-carbon/10 p-3">
                <code className="flex-1 break-all font-mono text-sm text-carbon">
                  {showFullSecret ? createdSecret : createdSecret.substring(0, 12) + '...'}
                </code>
                <button
                  onClick={() => setShowFullSecret(!showFullSecret)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                  title={showFullSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showFullSecret ? (
                    <MdVisibilityOff className="h-4 w-4" />
                  ) : (
                    <MdVisibility className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCopySecret(createdSecret)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                  title="Copy secret"
                >
                  {copiedSecret ? (
                    <MdCheck className="h-4 w-4 text-verdant" />
                  ) : (
                    <MdContentCopy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-carbon/10">
              <Button
                variant="primary"
                onClick={() => {
                  setCreatedSecret(null);
                  setCopiedSecret(false);
                  setShowFullSecret(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────────────────── */}
      {editingWebhook && (
        <Modal
          isOpen={!!editingWebhook}
          onClose={() => setEditingWebhook(null)}
          title="Edit Webhook"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="URL (HTTPS required)"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
            />

            <Input
              label="Description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">
                Events
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((evt) => (
                  <label
                    key={evt.value}
                    className="flex items-center gap-2 rounded-md border border-carbon/10 p-2 cursor-pointer hover:bg-carbon/2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={editEvents.includes(evt.value)}
                      onChange={() => toggleEditEvent(evt.value)}
                      className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{evt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm text-carbon">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-carbon/10">
              <Button variant="outline" onClick={() => setEditingWebhook(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Delete Confirmation ──────────────────────────────────────────── */}
      {deletingWebhook && (
        <DeleteConfirmationModal
          isOpen={!!deletingWebhook}
          onClose={() => setDeletingWebhook(null)}
          onConfirm={handleDelete}
          title="Delete Webhook"
          message="This will permanently remove this webhook. You will no longer receive event notifications at this endpoint."
          itemName={truncateUrl(deletingWebhook.url, 60)}
          isLoading={deleteMutation.isPending}
          variant="delete"
        />
      )}

      {/* ─── Deliveries Modal ─────────────────────────────────────────────── */}
      {deliveriesWebhookId && (
        <Modal
          isOpen={!!deliveriesWebhookId}
          onClose={() => setDeliveriesWebhookId(null)}
          title="Recent Deliveries"
          size="xl"
        >
          <div>
            {deliveriesLoading ? (
              <div className="py-8">
                <Loading size="md" />
              </div>
            ) : !deliveriesData?.data || deliveriesData.data.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-carbon/60">No deliveries recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-carbon/10">
                      <th className="px-3 py-2 text-left font-medium text-carbon/70">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-carbon/70">Event</th>
                      <th className="px-3 py-2 text-left font-medium text-carbon/70">HTTP Status</th>
                      <th className="px-3 py-2 text-left font-medium text-carbon/70">Attempt</th>
                      <th className="px-3 py-2 text-left font-medium text-carbon/70">Delivered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveriesData.data.map((delivery) => (
                      <tr
                        key={delivery.delivery_id}
                        className="border-b border-carbon/5"
                      >
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              delivery.status === 'success'
                                ? 'bg-verdant/10 text-verdant'
                                : delivery.status === 'failed'
                                  ? 'bg-smudged-lips/10 text-smudged-lips'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {delivery.status === 'success' && <MdCheck className="h-3 w-3" />}
                            {delivery.status === 'failed' && <MdClose className="h-3 w-3" />}
                            {delivery.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-carbon/70">
                          <code className="text-xs">{delivery.event_type}</code>
                        </td>
                        <td className="px-3 py-2 text-carbon/70">
                          {delivery.response_status ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-carbon/70">
                          {delivery.attempt_number}
                        </td>
                        <td className="px-3 py-2 text-carbon/60">
                          {formatDateTime(delivery.delivered_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-4 border-t border-carbon/10">
              <Button variant="outline" onClick={() => setDeliveriesWebhookId(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
