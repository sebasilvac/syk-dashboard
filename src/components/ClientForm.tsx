import { useState } from 'react';
import type { Client } from '@/types/models';
import type { ValidationError } from '@/lib/formValidation';
import { validateClientForm } from '@/lib/clientValidation';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';

interface ClientFormProps {
  client?: Client;
  onSave: (data: Omit<Client, 'id'>) => void;
  onCancel: () => void;
  errors?: ValidationError[];
}

export function ClientForm({ client, onSave, onCancel, errors: externalErrors }: ClientFormProps) {
  const [name, setName] = useState(client?.name ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [localErrors, setLocalErrors] = useState<ValidationError[]>([]);

  const errors = externalErrors ?? localErrors;

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = { name, email, phone };
    const validationErrors = validateClientForm(data);

    if (validationErrors.length > 0) {
      setLocalErrors(validationErrors);
      return;
    }

    setLocalErrors([]);
    onSave(data);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label="Nombre"
        error={getFieldError('name')}
        id="client-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del cliente"
      />

      <Input
        label="Correo electrónico"
        error={getFieldError('email')}
        id="client-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="correo@ejemplo.com"
      />

      <Input
        label="Teléfono de contacto"
        error={getFieldError('phone')}
        id="client-phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+52 000 000 0000"
      />

      <div className="flex items-center justify-end gap-3 mt-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {client ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  );
}

export type { ClientFormProps };
