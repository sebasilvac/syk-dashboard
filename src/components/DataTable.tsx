import './DataTable.css';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  rowClassName,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="data-table__empty" role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        <thead className="data-table__head">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="data-table__th">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table__body">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''} ${rowClassName ? rowClassName(item) : ''}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }
                  : undefined
              }
              role={onRowClick ? 'button' : undefined}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="data-table__td">
                  {col.render
                    ? col.render(item)
                    : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { Column, DataTableProps };
