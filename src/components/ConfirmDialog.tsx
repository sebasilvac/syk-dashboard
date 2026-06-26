import { Modal } from '@/design-system/components/Modal';
import { Button } from '@/design-system/components/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'destructive' | 'default';
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </div>
      }
    >
      <p className="text-[0.9375rem] text-text-primary leading-relaxed">{message}</p>
    </Modal>
  );
}

export type { ConfirmDialogProps };
