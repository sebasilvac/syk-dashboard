interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-accent text-white hover:bg-accent/90',
  secondary: 'bg-transparent border border-secondary text-text-muted hover:border-accent-soft',
  destructive: 'bg-red-900 text-red-100 hover:bg-red-800',
  ghost: 'bg-transparent text-text-muted hover:text-text-primary',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const commonClasses =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-xl transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  onClick,
  children,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${commonClasses} ${variantClasses[variant]} ${sizeClasses[size]}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
