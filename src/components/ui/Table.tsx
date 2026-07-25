import type { ReactNode } from 'react';
import { Icon } from '../Icons';

export type Column = {
  key: string;
  header?: ReactNode;
  /** Right-aligns the header and its cells. */
  align?: 'right';
};

type TableProps = {
  columns: Column[];
  children: ReactNode;
  /** Adds a hairline above the header, for a table that follows a PanelHead. */
  ruled?: boolean;
};

export function Table({ columns, children, ruled }: TableProps) {
  return (
    <div className={`table-wrap ${ruled ? 'table-ruled' : ''}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === 'right' ? 'num' : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
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
