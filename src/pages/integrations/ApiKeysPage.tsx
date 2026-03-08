import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useRevokeApiKey,
  useRotateApiKey,
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
  MdVpnKey,
  MdAdd,
  MdEdit,
  MdDelete,
  MdRefresh,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdWarning,
  MdCheck,
} from 'react-icons/md';
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/types/integrations';

// ─── Permission options ──────────────────────────────────────────────────────

const PERMISSION_OPTIONS = [
  { value: 'patients:read', label: 'Read Patients' },
  { value: 'patients:write', label: 'Write Patients' },
  { value: 'appointments:read', label: 'Read Appointments' },
  { value: 'appointments:write', label: 'Write Appointments' },
  { value: 'doctors:read', label: 'Read Doctors' },
  { value: 'services:read', label: 'Read Services' },
  { value: 'analytics:read', label: 'Read Analytics' },
  { value: 'webhooks:manage', label: 'Manage Webhooks' },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

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

// ─── Page Component ──────────────────────────────────────────────────────────

export const ApiKeysPage = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();

  // State
  const [page, setPage] = useState(1);
  const limit = 20;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [revokingKey, setRevokingKey] = useState<ApiKey | null>(null);
  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [rotatedKey, setRotatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);
  const [createExpiresAt, setCreateExpiresAt] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Hooks
  const { data: apiKeysData, isLoading } = useApiKeys({ page, limit });
  const createMutation = useCreateApiKey();
  const updateMutation = useUpdateApiKey();
  const revokeMutation = useRevokeApiKey();
  const rotateMutation = useRotateApiKey();

  const apiKeys = apiKeysData?.data ?? [];
  const total = apiKeysData?.total ?? 0;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(true);
      showSuccess('API key copied to clipboard');
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      showError('Failed to copy key to clipboard');
    }
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreatePermissions([]);
    setCreateExpiresAt('');
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      showError('Please enter a name for the API key');
      return;
    }
    if (createPermissions.length === 0) {
      showError('Please select at least one permission');
      return;
    }

    try {
      const payload: CreateApiKeyRequest = {
        name: createName.trim(),
        permissions: createPermissions,
      };
      if (createExpiresAt) {
        payload.expires_at = new Date(createExpiresAt).toISOString();
      }

      const result = await createMutation.mutateAsync(payload);
      setShowCreateModal(false);
      resetCreateForm();

      // Show the full key once
      if (result?.key) {
        setCreatedKey(result.key);
      } else {
        showSuccess('API key created successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create API key';
      showError(message);
    }
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setEditName(key.name);
    setEditPermissions([...key.permissions]);
    setEditIsActive(key.is_active);
  };

  const handleUpdate = async () => {
    if (!editingKey) return;
    if (!editName.trim()) {
      showError('Please enter a name for the API key');
      return;
    }

    try {
      const payload: UpdateApiKeyRequest = {
        name: editName.trim(),
        permissions: editPermissions,
        is_active: editIsActive,
      };
      await updateMutation.mutateAsync({ id: editingKey.api_key_id, data: payload });
      setEditingKey(null);
      showSuccess('API key updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update API key';
      showError(message);
    }
  };

  const handleRevoke = async () => {
    if (!revokingKey) return;
    try {
      await revokeMutation.mutateAsync(revokingKey.api_key_id);
      setRevokingKey(null);
      showSuccess('API key revoked successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke API key';
      showError(message);
    }
  };

  const handleRotate = async () => {
    if (!rotatingKey) return;
    try {
      const result = await rotateMutation.mutateAsync(rotatingKey.api_key_id);
      setRotatingKey(null);
      if (result?.new_key?.key) {
        setRotatedKey(result.new_key.key);
      } else {
        showSuccess('API key rotated successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rotate API key';
      showError(message);
    }
  };

  const toggleCreatePermission = (perm: string) => {
    setCreatePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleEditPermission = (perm: string) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
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
              API Keys
            </h1>
            <p className="text-sm text-carbon/60">
              Create and manage API keys for external integrations.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            API Keys ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12">
              <Loading size="lg" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-12 text-center">
              <MdVpnKey className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60 mb-2">No API keys yet</p>
              <p className="text-xs text-carbon/40">
                Create your first API key to start integrating with H360.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-carbon/10">
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Name</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Key</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Permissions</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Status</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Expires</th>
                      <th className="px-3 py-3 text-left font-medium text-carbon/70">Last Used</th>
                      <th className="px-3 py-3 text-right font-medium text-carbon/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr
                        key={apiKey.api_key_id}
                        className="border-b border-carbon/5 hover:bg-carbon/2"
                      >
                        <td className="px-3 py-3 font-medium text-carbon">
                          {apiKey.name}
                        </td>
                        <td className="px-3 py-3">
                          <code className="rounded bg-carbon/5 px-2 py-1 font-mono text-xs text-carbon/70">
                            {apiKey.key_prefix}...
                          </code>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.slice(0, 3).map((perm) => (
                              <span
                                key={perm}
                                className="inline-flex rounded-full bg-azure-dragon/10 px-2 py-0.5 text-xs text-azure-dragon"
                              >
                                {perm}
                              </span>
                            ))}
                            {apiKey.permissions.length > 3 && (
                              <span className="inline-flex rounded-full bg-carbon/10 px-2 py-0.5 text-xs text-carbon/60">
                                +{apiKey.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              apiKey.is_active
                                ? 'bg-verdant/10 text-verdant'
                                : 'bg-smudged-lips/10 text-smudged-lips'
                            }`}
                          >
                            {apiKey.is_active ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-carbon/60">
                          {formatDate(apiKey.expires_at)}
                        </td>
                        <td className="px-3 py-3 text-carbon/60">
                          {formatDateTime(apiKey.last_used_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(apiKey)}
                              className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-azure-dragon transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            {apiKey.is_active && (
                              <button
                                onClick={() => setRotatingKey(apiKey)}
                                className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-amber-600 transition-colors"
                                title="Rotate"
                              >
                                <MdRefresh className="h-4 w-4" />
                              </button>
                            )}
                            {apiKey.is_active && (
                              <button
                                onClick={() => setRevokingKey(apiKey)}
                                className="rounded p-1.5 text-carbon/50 hover:bg-carbon/5 hover:text-smudged-lips transition-colors"
                                title="Revoke"
                              >
                                <MdDelete className="h-4 w-4" />
                              </button>
                            )}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} keys
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
          title="Create API Key"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="e.g., Production Integration"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSION_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 rounded-md border border-carbon/10 p-2 cursor-pointer hover:bg-carbon/2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={createPermissions.includes(opt.value)}
                      onChange={() => toggleCreatePermission(opt.value)}
                      className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              label="Expiration Date (optional)"
              type="date"
              value={createExpiresAt}
              onChange={(e) => setCreateExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

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
                {createMutation.isPending ? 'Creating...' : 'Create API Key'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Created Key Display Modal ────────────────────────────────────── */}
      {createdKey && (
        <Modal
          isOpen={!!createdKey}
          onClose={() => {
            setCreatedKey(null);
            setCopiedKey(false);
            setShowFullKey(false);
          }}
          title="API Key Created"
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <MdWarning className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Save this key now - you will not be able to see it again!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Store it securely. If lost, you will need to rotate or create a new key.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 rounded-md bg-carbon/5 border border-carbon/10 p-3">
                <code className="flex-1 break-all font-mono text-sm text-carbon">
                  {showFullKey ? createdKey : createdKey.substring(0, 12) + '...'}
                </code>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                  title={showFullKey ? 'Hide key' : 'Show key'}
                >
                  {showFullKey ? (
                    <MdVisibilityOff className="h-4 w-4" />
                  ) : (
                    <MdVisibility className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCopyKey(createdKey)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                  title="Copy key"
                >
                  {copiedKey ? (
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
                  setCreatedKey(null);
                  setCopiedKey(false);
                  setShowFullKey(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Rotated Key Display Modal ────────────────────────────────────── */}
      {rotatedKey && (
        <Modal
          isOpen={!!rotatedKey}
          onClose={() => {
            setRotatedKey(null);
            setCopiedKey(false);
            setShowFullKey(false);
          }}
          title="API Key Rotated"
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <MdWarning className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Your key has been rotated. Save the new key now!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    The old key is no longer valid. Update your integration with this new key.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 rounded-md bg-carbon/5 border border-carbon/10 p-3">
                <code className="flex-1 break-all font-mono text-sm text-carbon">
                  {showFullKey ? rotatedKey : rotatedKey.substring(0, 12) + '...'}
                </code>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                >
                  {showFullKey ? (
                    <MdVisibilityOff className="h-4 w-4" />
                  ) : (
                    <MdVisibility className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleCopyKey(rotatedKey)}
                  className="shrink-0 rounded p-1.5 text-carbon/50 hover:bg-carbon/10 transition-colors"
                >
                  {copiedKey ? (
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
                  setRotatedKey(null);
                  setCopiedKey(false);
                  setShowFullKey(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────────────────── */}
      {editingKey && (
        <Modal
          isOpen={!!editingKey}
          onClose={() => setEditingKey(null)}
          title="Edit API Key"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSION_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 rounded-md border border-carbon/10 p-2 cursor-pointer hover:bg-carbon/2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(opt.value)}
                      onChange={() => toggleEditPermission(opt.value)}
                      className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{opt.label}</span>
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
              <Button variant="outline" onClick={() => setEditingKey(null)}>
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

      {/* ─── Revoke Confirmation ──────────────────────────────────────────── */}
      {revokingKey && (
        <DeleteConfirmationModal
          isOpen={!!revokingKey}
          onClose={() => setRevokingKey(null)}
          onConfirm={handleRevoke}
          title="Revoke API Key"
          message="This will permanently disable this API key. Any application using this key will lose access immediately."
          itemName={revokingKey.name}
          isLoading={revokeMutation.isPending}
          variant="delete"
        />
      )}

      {/* ─── Rotate Confirmation ──────────────────────────────────────────── */}
      {rotatingKey && !rotatedKey && (
        <DeleteConfirmationModal
          isOpen={!!rotatingKey}
          onClose={() => setRotatingKey(null)}
          onConfirm={handleRotate}
          title="Rotate API Key"
          message="This will generate a new key and invalidate the current one. Make sure to update your integrations with the new key."
          itemName={rotatingKey.name}
          isLoading={rotateMutation.isPending}
          actionLabel="Rotate Key"
          variant="deactivate"
        />
      )}
    </div>
  );
};
