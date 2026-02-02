import React, { useState, useMemo } from 'react';
import { TableColumn, BaseEntity } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/ui';

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  isRowExpandable?: (item: T) => boolean;
  expandedRows?: Set<string | number>;
  onToggleExpand?: (itemId: string | number) => void;
}

export function Table<T extends BaseEntity & { [key: string]: any }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Нет данных для отображения',
  expandable = false,
  renderExpandedContent,
  isRowExpandable,
  expandedRows = new Set(),
  onToggleExpand,
}: TableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortState(prevState => {
      if (prevState.column !== columnKey) {
        return { column: columnKey, direction: 'asc' };
      }
      const nextDirection = prevState.direction === 'asc' ? 'desc' :
        prevState.direction === 'desc' ? null : 'asc';
      return {
        column: nextDirection ? columnKey : null,
        direction: nextDirection
      };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortState.column!];
      const bValue = b[sortState.column!];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue || '').toLowerCase();
      const bString = String(bValue || '').toLowerCase();

      if (sortState.direction === 'asc') {
        return aString.localeCompare(bString);
      }
      return bString.localeCompare(aString);
    });
  }, [data, sortState]);

  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: `${SPACING.XXL} ${SPACING.LG}`,
          color: COLORS.GRAY[500],
          fontSize: '16px',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${COLORS.GRAY[300]}`,
        borderRadius: BORDER_RADIUS.MD,
        overflow: 'hidden',
        backgroundColor: COLORS.WHITE,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: COLORS.GRAY[50] }}>
            {expandable && (
              <th
                style={{
                  padding: `${SPACING.MD} ${SPACING.LG}`,
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: COLORS.GRAY[700],
                  borderBottom: `1px solid ${COLORS.GRAY[300]}`,
                  width: '50px',
                }}
              >
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  padding: `${SPACING.MD} ${SPACING.LG}`,
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: COLORS.GRAY[700],
                  borderBottom: `1px solid ${COLORS.GRAY[300]}`,
                  width: column.width,
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {column.title}
                  {column.sortable && (
                    <span style={{
                      color: sortState.column === column.key ? COLORS.GRAY[900] : COLORS.GRAY[400],
                      fontSize: '12px',
                      marginLeft: '4px',
                      width: '12px',
                    }}>
                      {sortState.column === column.key ? (
                        sortState.direction === 'asc' ? '▲' :
                          sortState.direction === 'desc' ? '▼' : '◆'
                      ) : '◆'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => {
            const itemId = item.id ?? item.tgId;
            if (!itemId) return null;

            const isExpanded = expandedRows.has(itemId);
            const canExpand = expandable && (!isRowExpandable || isRowExpandable(item));

            return (
              <React.Fragment key={itemId}>
                <tr
                  style={{
                    backgroundColor: isExpanded ? COLORS.GRAY[100] : (index % 2 === 0 ? COLORS.WHITE : COLORS.GRAY[50]),
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => onRowClick?.(item)}
                  onMouseEnter={(e) => {
                    if (onRowClick && !isExpanded) {
                      e.currentTarget.style.backgroundColor = COLORS.GRAY[100];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? COLORS.WHITE : COLORS.GRAY[50];
                    }
                  }}
                >
                  {expandable && (
                    <td
                      style={{
                        padding: `${SPACING.MD} ${SPACING.LG}`,
                        borderBottom: `1px solid ${COLORS.GRAY[200]}`,
                        fontSize: '14px',
                        color: COLORS.GRAY[700],
                      }}
                    >
                      {canExpand && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand?.(itemId);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                            color: COLORS.GRAY[500],
                          }}
                          title={isExpanded ? 'Свернуть' : 'Развернуть'}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      style={{
                        padding: `${SPACING.MD} ${SPACING.LG}`,
                        borderBottom: `1px solid ${COLORS.GRAY[200]}`,
                        fontSize: '14px',
                        color: COLORS.GRAY[700],
                      }}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
                {expandable && isExpanded && renderExpandedContent && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      style={{
                        padding: 0,
                        borderBottom: `1px solid ${COLORS.GRAY[200]}`,
                        backgroundColor: COLORS.GRAY[50],
                      }}
                    >
                      <div style={{ padding: `${SPACING.LG} ${SPACING.XL}` }}>
                        {renderExpandedContent(item)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 