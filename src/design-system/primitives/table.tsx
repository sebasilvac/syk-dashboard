import { forwardRef, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';

export interface BaseTableProps extends HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export const BaseTable = forwardRef<HTMLTableElement, BaseTableProps>(
  function BaseTable({ className, ...props }, ref) {
    return <table ref={ref} className={className} {...props} />;
  }
);

export const BaseTableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function BaseTableHeader({ className, ...props }, ref) {
    return <thead ref={ref} className={className} {...props} />;
  }
);

export const BaseTableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function BaseTableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={className} {...props} />;
  }
);

export const BaseTableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function BaseTableRow({ className, ...props }, ref) {
    return <tr ref={ref} className={className} {...props} />;
  }
);

export const BaseTableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function BaseTableHead({ className, ...props }, ref) {
    return <th ref={ref} className={className} {...props} />;
  }
);

export const BaseTableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function BaseTableCell({ className, ...props }, ref) {
    return <td ref={ref} className={className} {...props} />;
  }
);
