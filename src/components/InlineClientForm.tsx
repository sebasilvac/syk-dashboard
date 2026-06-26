import { useState } from 'react';
import type { Client } from '@/types/models';
import type { ValidationError } from '@/lib/formValidation';
import { validateClientForm } from '@/lib/clientValidation';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';

interface InlineClientFormProps {
  onSave: (data: Omit<Client, 'id'>) => void;
  onCancel: () => void;
}

export function InlineClientForm({ onSave, onCancel }: InlineClientFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = { name, email, phone };
    const validationErrors = validateClientForm(data);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSave(data);
  }

  return (
    <form className="flex flex-col gap-4 p-6 bg-bg-secondary border border-secondary rounded-2xl mt-2" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 mb-1">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-accent"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        <span className="text-sm font-semibold text-text-primary">Nuevo cliente</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Nombre"
          error={getFieldError('name')}
          id="inline-client-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del cliente"
        />

        <Input
          label="Email"
          error={getFieldError('email')}
          id="inline-client-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
        />

        <Input
          label="Teléfono"
          error={getFieldError('phone')}
          id="inline-client-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+52 000 000 0000"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} type="button" size="sm">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" size="sm">
          Guardar cliente
        </Button>
      </div>
    </form>
  );
}

export type { InlineClientFormProps };
