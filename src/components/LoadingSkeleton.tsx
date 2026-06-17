export interface SkeletonProps {
  variant: 'card' | 'row' | 'text' | 'circle';
  count?: number;
  className?: string;
}

const baseClasses = 'animate-pulse bg-gradient-to-r from-surface to-bg-secondary';

const variantClasses: Record<SkeletonProps['variant'], string> = {
  card: 'h-24 w-full rounded-2xl',
  row: 'h-12 w-full rounded-xl',
  text: 'h-4 w-3/4 rounded-xl',
  circle: 'w-12 h-12 rounded-full',
};

export function LoadingSkeleton({ variant, count = 1, className = '' }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  ));

  return <>{elements}</>;
}
