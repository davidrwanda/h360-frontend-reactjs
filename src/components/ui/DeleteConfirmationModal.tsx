import { Modal } from './Modal';
import { Button } from './Button';
import { MdWarning, MdDelete } from 'react-icons/md';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  actionLabel?: string;
  variant?: 'delete' | 'deactivate';
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  actionLabel,
  variant = 'delete',
}: DeleteConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const defaultActionLabel = variant === 'deactivate' ? 'Deactivate' : 'Delete';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-smudged-lips/10">
              <MdWarning className="h-6 w-6 text-smudged-lips" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-carbon/80 leading-relaxed">{message}</p>
            {itemName && (
              <p className="mt-2 text-sm font-medium text-carbon">
                <span className="text-carbon/60">Item:</span> {itemName}
              </p>
            )}
          </div>
        </div>

        {/* Warning Note */}
        {variant === 'deactivate' && (
          <div className="rounded-md bg-bright-halo/10 border border-bright-halo/20 px-3.5 py-2.5">
            <p className="text-xs text-carbon/70">
              This action can be reversed later by reactivating the clinic.
            </p>
          </div>
        )}
        {variant === 'delete' && actionLabel === 'Activate' && (
          <div className="rounded-md bg-bright-halo/10 border border-bright-halo/20 px-3.5 py-2.5">
            <p className="text-xs text-carbon/70">
              The clinic will become active and available for appointments.
            </p>
          </div>
        )}
        {variant === 'delete' && actionLabel !== 'Activate' && (
          <div className="rounded-md bg-bright-halo/10 border border-bright-halo/20 px-3.5 py-2.5">
            <p className="text-xs text-carbon/70">
              This action cannot be undone. Please make sure you want to proceed.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            <MdDelete className="h-4 w-4 mr-2" />
            {actionLabel || defaultActionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
