import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

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
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-[0.9375rem] text-text-primary leading-relaxed mb-6">{message}</p>
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
    </Modal>
  );
}

export type { ConfirmDialogProps };
