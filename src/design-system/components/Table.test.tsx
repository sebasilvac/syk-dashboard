import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { Table, type TableColumn } from '@/design-system/components/Table';

/**
 * Component tests for Table wrapper.
 * Validates: Requirements 9.1–9.5, Properties 5, 6
 */

interface TestItem {
  id: string;
  name: string;
  email: string;
}

const sampleColumns: TableColumn<TestItem>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

const sampleData: TestItem[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('Table', () => {
  describe('header rendering', () => {
    it('renders headers from column definitions', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders headers as th elements', () => {
      const { container } = render(<Table columns={sampleColumns} data={sampleData} />);
      const thElements = container.querySelectorAll('th');
      expect(thElements).toHaveLength(2);
      expect(thElements[0]!.textContent).toBe('Name');
      expect(thElements[1]!.textContent).toBe('Email');
    });
  });

  describe('empty state', () => {
    it('shows emptyMessage when data is empty', () => {
      render(<Table columns={sampleColumns} data={[]} emptyMessage="No records" />);
      expect(screen.getByText('No records')).toBeInTheDocument();
    });

    it('uses default emptyMessage when none provided', () => {
      render(<Table columns={sampleColumns} data={[]} />);
      expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    });
  });

  describe('custom render function', () => {
    it('supports custom render function in columns', () => {
      const columnsWithRender: TableColumn<TestItem>[] = [
        { key: 'name', header: 'Name', render: (item) => <strong>{item.name.toUpperCase()}</strong> },
        { key: 'email', header: 'Email' },
      ];
      render(<Table columns={columnsWithRender} data={sampleData} />);
      expect(screen.getByText('ALICE')).toBeInTheDocument();
      expect(screen.getByText('BOB')).toBeInTheDocument();
    });
  });

  describe('interactive rows', () => {
    it('calls onRowClick when row is clicked', () => {
      const handleRowClick = vi.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      fireEvent.click(screen.getByText('Alice'));
      expect(handleRowClick).toHaveBeenCalledWith(sampleData[0]);
    });

    it('sets role="button" on interactive rows', () => {
      const handleRowClick = vi.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      const rows = screen.getAllByRole('button');
      expect(rows.length).toBe(2);
    });

    it('activates row with Enter key', () => {
      const handleRowClick = vi.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      const row = screen.getAllByRole('button')[0]!;
      fireEvent.keyDown(row, { key: 'Enter' });
      expect(handleRowClick).toHaveBeenCalledWith(sampleData[0]);
    });

    it('activates row with Space key', () => {
      const handleRowClick = vi.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      const row = screen.getAllByRole('button')[0]!;
      fireEvent.keyDown(row, { key: ' ' });
      expect(handleRowClick).toHaveBeenCalledWith(sampleData[0]);
    });

    it('makes interactive rows focusable', () => {
      const handleRowClick = vi.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      const rows = screen.getAllByRole('button');
      rows.forEach((row) => {
        expect(row).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Property 5: Table renders headers matching column definitions', () => {
    /**
     * **Validates: Requirements 9.2**
     *
     * For any array of TableColumn definitions, renders exactly one <th> per column
     * with matching header text.
     */
    it('renders exactly one th per column with matching header text', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
              header: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
            }),
            { minLength: 1, maxLength: 10 },
          ).filter((arr) => {
            const keys = arr.map((c) => c.key);
            return new Set(keys).size === keys.length;
          }),
          (columnDefs) => {
            const columns: TableColumn<{ id: string; [k: string]: string }>[] = columnDefs.map((c) => ({
              key: c.key,
              header: c.header,
            }));
            const data = [{ id: '1', ...Object.fromEntries(columnDefs.map((c) => [c.key, 'value'])) }];
            const { container, unmount } = render(<Table columns={columns} data={data} />);
            const thElements = container.querySelectorAll('th');
            expect(thElements).toHaveLength(columnDefs.length);
            columnDefs.forEach((col, i) => {
              expect(thElements[i]!.textContent).toBe(col.header);
            });
            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 6: Table custom cell rendering', () => {
    /**
     * **Validates: Requirements 9.5**
     *
     * For any column with a render function, displays the render output instead of raw value.
     */
    it('displays render output instead of raw value for columns with render function', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
          (key, rawValue, renderPrefix) => {
            const renderOutput = `${renderPrefix}-rendered`;
            const columns: TableColumn<{ id: string; [k: string]: string }>[] = [
              { key, header: 'Header', render: () => <span data-testid="rendered">{renderOutput}</span> },
            ];
            const data = [{ id: '1', [key]: rawValue }];
            const { container, unmount } = render(<Table columns={columns} data={data} />);

            const renderedEl = container.querySelector('[data-testid="rendered"]');
            expect(renderedEl).not.toBeNull();
            expect(renderedEl!.textContent).toBe(renderOutput);

            // The cell should contain the rendered output, not the raw value
            const cells = container.querySelectorAll('td');
            const cellTexts = Array.from(cells).map((c) => c.textContent);
            expect(cellTexts.some((t) => t?.includes(renderOutput))).toBe(true);

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
