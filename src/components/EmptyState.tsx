import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-6 text-text-muted opacity-60" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export type { EmptyStateProps };
