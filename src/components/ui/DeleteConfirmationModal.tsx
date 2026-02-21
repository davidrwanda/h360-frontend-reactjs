import { Modal } from './Modal';
import { Button } from './Button';
import { MdWarning, MdDelete, MdCheckCircle } from 'react-icons/md';
import { cn } from '@/utils/cn';
import { useTranslation, COMMON } from '@/i18n';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  itemLabel?: string;
  isLoading?: boolean;
  actionLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  note?: string;
  variant?: 'delete' | 'deactivate' | 'activate';
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemLabel,
  isLoading = false,
  actionLabel,
  confirmText,
  cancelLabel,
  note,
  variant = 'delete',
}: DeleteConfirmationModalProps) => {
  const { t } = useTranslation();
  const isActivate = variant === 'activate';
  const resolvedItemLabel = itemLabel || t(COMMON.ITEM);
  const resolvedCancelLabel = cancelLabel || t(COMMON.CANCEL);
  const buttonText = confirmText || actionLabel || (
    variant === 'deactivate' ? t(COMMON.DEACTIVATE) : variant === 'activate' ? t(COMMON.ACTIVATE) : t(COMMON.DELETE)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isActivate ? 'bg-bright-halo/20' : 'bg-smudged-lips/10'
            )}>
              {isActivate ? (
                <MdCheckCircle className="h-6 w-6 text-azure-dragon" />
              ) : (
                <MdWarning className="h-6 w-6 text-smudged-lips" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-carbon/80 leading-relaxed">{message}</p>
            {itemName && (
              <p className="mt-2 text-sm font-medium text-carbon">
                <span className="text-carbon/60">{resolvedItemLabel}:</span> {itemName}
              </p>
            )}
          </div>
        </div>

        {note && (
          <div className={cn(
            'rounded-md px-3.5 py-2.5 border',
            isActivate
              ? 'bg-bright-halo/10 border-bright-halo/20'
              : 'bg-bright-halo/10 border-bright-halo/20'
          )}>
            <p className="text-xs text-carbon/70">{note}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {resolvedCancelLabel}
          </Button>
          <Button
            variant={isActivate ? 'primary' : 'danger'}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {!isActivate && <MdDelete className="h-4 w-4 mr-2" />}
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
