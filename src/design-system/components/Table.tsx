import { type ReactNode } from 'react';
import {
  BaseTable,
  BaseTableHeader,
  BaseTableBody,
  BaseTableRow,
  BaseTableHead,
  BaseTableCell,
} from '@/design-system/primitives/table';
import {
  tableWrapperVariants,
  tableVariants,
  tableHeaderVariants,
  tableHeadCellVariants,
  tableRowVariants,
  tableCellVariants,
} from '@/design-system/variants/table';
import { cn } from '@/design-system/utils/cn';
import type {
  TableWrapperVariant,
  TableVariant,
  TableHeadCellAlign,
  TableCellAlign,
} from '@/design-system/variants/table';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: TableCellAlign;
  headerAlign?: TableHeadCellAlign;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  wrapperVariant?: TableWrapperVariant;
  tableVariant?: TableVariant;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className,
  wrapperVariant = 'default',
  tableVariant = 'default',
}: TableProps<T>): ReactNode {
  function handleRowKeyDown(e: React.KeyboardEvent, item: T) {
    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onRowClick(item);
    }
  }

  return (
    <div className={cn(tableWrapperVariants({ variant: wrapperVariant }), className)}>
      <div className="w-full overflow-x-auto">
        <BaseTable className={tableVariants({ variant: tableVariant })}>
          <BaseTableHeader className={tableHeaderVariants({})}>
            <BaseTableRow className="border-b border-secondary/20">
              {columns.map((col) => (
                <BaseTableHead
                  key={String(col.key)}
                  className={tableHeadCellVariants({ align: col.headerAlign ?? col.align })}
                  style={col.width ? { width: col.width } : undefined}
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
                  className="px-4 py-12 text-center text-text-muted"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-secondary/60"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
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
                  className={tableRowVariants({ interactive: onRowClick ? 'true' : 'false' })}
                >
                  {columns.map((col) => (
                    <BaseTableCell
                      key={String(col.key)}
                      className={tableCellVariants({ align: col.align })}
                    >
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
    </div>
  );
}
