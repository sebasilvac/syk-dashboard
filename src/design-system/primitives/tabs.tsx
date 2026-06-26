import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';

export interface BaseTabsProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseTabs = forwardRef<HTMLDivElement, BaseTabsProps>(
  function BaseTabs({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

export interface BaseTabsListProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseTabsList = forwardRef<HTMLDivElement, BaseTabsListProps>(
  function BaseTabsList({ className, ...props }, ref) {
    return <div ref={ref} role="tablist" className={className} {...props} />;
  }
);

export interface BaseTabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const BaseTabsTrigger = forwardRef<HTMLButtonElement, BaseTabsTriggerProps>(
  function BaseTabsTrigger({ className, ...props }, ref) {
    return <button ref={ref} role="tab" className={className} {...props} />;
  }
);

export interface BaseTabsContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseTabsContent = forwardRef<HTMLDivElement, BaseTabsContentProps>(
  function BaseTabsContent({ className, ...props }, ref) {
    return <div ref={ref} role="tabpanel" className={className} {...props} />;
  }
);
