import type { ReactNode, Ref } from 'react';
import { Icon } from '../Icons';

export type Column = {
  key: string;
  header?: ReactNode;
  /** Right-aligns the header and its cells. */
  align?: 'right';
  /** Turns the header into a sort control. Requires `sort` + `onSort` on the table. */
  sortable?: boolean;
};

export type Sort = { key: string; dir: 'asc' | 'desc' };

type TableProps = {
  columns: Column[];
  children: ReactNode;
  /** Adds a hairline above the header, for a table that follows a PanelHead. */
  ruled?: boolean;
  /** Which column is sorted, and which way. */
  sort?: Sort;
  /** Called with the column key. The caller decides how the direction flips. */
  onSort?: (key: string) => void;
  /** Handle on the row container, for tables that move focus between rows. */
  bodyRef?: Ref<HTMLTableSectionElement>;
  /** Extra classes on the wrapper, e.g. a density modifier. */
  className?: string;
};

export function Table({ columns, children, ruled, sort, onSort, bodyRef, className }: TableProps) {
  return (
    <div className={`table-wrap ${ruled ? 'table-ruled' : ''} ${className ?? ''}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              const canSort = column.sortable && onSort;
              return (
                <th
                  key={column.key}
                  className={column.align === 'right' ? 'num' : undefined}
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {canSort ? (
                    <button
                      type="button"
                      className={`th-sort ${active ? 'on' : ''}`.trim()}
                      onClick={() => onSort(column.key)}
                    >
                      {column.header}
                      {/* The caret only appears on the sorted column: an arrow on
                          every header reads as though they are all active. */}
                      <Icon.Chevron
                        size={11}
                        weight="bold"
                        className={`th-caret ${active ? 'on' : ''} ${active && sort.dir === 'asc' ? 'up' : ''}`.trim()}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody ref={bodyRef}>{children}</tbody>
      </table>
    </div>
  );
}

/** Chevron cell that signals a row opens something. */
export function RowChevron() {
  return (
    <td className="num">
      <Icon.Chevron size={14} className="ep-chev" />
    </td>
  );
}

type PagerProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  /** Left-hand summary, e.g. "24 providers · 1,392 endpoints". */
  summary?: ReactNode;
};

export function TableFoot({ page, pages, onChange, summary }: PagerProps) {
  return (
    <div className="table-foot">
      <span className="dim">{summary}</span>
      <div className="pager">
        <button
          className="btn ghost icon-only"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <Icon.Chevron size={14} className="flip" />
        </button>
        <span className="mono dim">
          {page} / {pages}
        </span>
        <button
          className="btn ghost icon-only"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <Icon.Chevron size={14} />
        </button>
      </div>
    </div>
  );
}
