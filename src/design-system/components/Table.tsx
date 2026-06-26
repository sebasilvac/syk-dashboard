import { type ReactNode } from 'react';
import {
  BaseTable,
  BaseTableHeader,
  BaseTableBody,
  BaseTableRow,
  BaseTableHead,
  BaseTableCell,
} from '@/design-system/primitives/table';
import { tableRowVariants } from '@/design-system/variants/table';
import { cn } from '@/design-system/utils/cn';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className,
}: TableProps<T>): ReactNode {
  function handleRowKeyDown(e: React.KeyboardEvent, item: T) {
    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onRowClick(item);
    }
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <BaseTable className="w-full caption-bottom text-sm">
        <BaseTableHeader>
          <BaseTableRow className="border-b border-secondary/20">
            {columns.map((col) => (
              <BaseTableHead
                key={String(col.key)}
                className="px-4 py-3 text-left text-sm font-medium text-text-muted"
              >
                {col.header}
              </BaseTableHead>
            ))}
          </BaseTableRow>
        </BaseTableHeader>
        <BaseTableBody>
          {data.length === 0 ? (
            <BaseTableRow>
              <BaseTableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </BaseTableCell>
            </BaseTableRow>
          ) : (
            data.map((item) => (
              <BaseTableRow
                key={item.id}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, item) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                className={cn(
                  tableRowVariants({ interactive: onRowClick ? 'true' : 'false' }),
                )}
              >
                {columns.map((col) => (
                  <BaseTableCell key={String(col.key)} className="px-4 py-3">
                    {col.render
                      ? col.render(item)
                      : String(item[col.key as keyof T] ?? '')}
                  </BaseTableCell>
                ))}
              </BaseTableRow>
            ))
          )}
        </BaseTableBody>
      </BaseTable>
    </div>
  );
}
