import React from 'react';
import { colors, borders, spacing, typography } from '../../theme/theme';

interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string | number;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  selectedRow?: number | null;
  className?: string;
  headerClassName?: string;
  rowClassName?: (item: T, index: number) => string;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  compact?: boolean;
  bordered?: boolean;
  striped?: boolean;
}

function Table<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectedRow,
  className = '',
  headerClassName = '',
  rowClassName,
  stickyHeader = false,
  maxHeight,
  compact = false,
  bordered = true,
  striped = true,
}: TableProps<T>) {
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    border: bordered ? borders.standard : 'none',
    borderRadius: borders.radiusSm,
    overflow: 'hidden',
  };

  const tableContainerStyles = {
    position: 'relative' as const,
    overflowX: 'auto' as const,
    maxHeight: maxHeight ? maxHeight : 'none',
  };

  const theadStyles = {
    backgroundColor: colors.neutral.lighterGray,
    color: colors.neutral.darkerGray,
    position: stickyHeader ? ('sticky' as const) : ('static' as const),
    top: 0,
    zIndex: 1,
    boxShadow: stickyHeader ? `0 1px 0 0 ${colors.neutral.lightGray}` : 'none',
  };

  const thStyles = {
    padding: compact ? `${spacing.xs}px ${spacing.sm}px` : `${spacing.sm}px ${spacing.md}px`,
    textAlign: 'left' as const,
    fontWeight: typography.fontWeights.semiBold,
    borderBottom: `1px solid ${colors.neutral.lightGray}`,
    fontSize: typography.fontSizes.sm,
  };

  const trStyles = (index: number, isSelected: boolean) => ({
    backgroundColor: isSelected
      ? `${colors.primary.light}20`
      : striped && index % 2 !== 0
      ? colors.neutral.offWhite
      : colors.neutral.white,
    cursor: onRowClick ? 'pointer' : 'default',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: onRowClick ? `${colors.primary.light}10` : '',
    },
  });

  const tdStyles = {
    padding: compact ? `${spacing.xs}px ${spacing.sm}px` : `${spacing.sm}px ${spacing.md}px`,
    borderBottom: bordered ? `1px solid ${colors.neutral.lightGray}` : 'none',
    fontSize: typography.fontSizes.sm,
  };

  const loadingOrEmptyStyles = {
    padding: `${spacing.lg}px`,
    textAlign: 'center' as const,
    color: colors.neutral.darkGray,
  };

  const shimmerStyles = {
    height: '20px',
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borders.radiusSm,
    animation: 'shimmer 1.5s infinite linear',
    backgroundImage: `linear-gradient(
      to right,
      ${colors.neutral.lightGray} 0%,
      ${colors.neutral.lighterGray} 20%,
      ${colors.neutral.lightGray} 40%,
      ${colors.neutral.lightGray} 100%
    )`,
    backgroundSize: '800px 100%',
    backgroundRepeat: 'no-repeat',
  };

  // Generate loading rows
  const renderLoadingRows = () => {
    return Array(5)
      .fill(0)
      .map((_, rowIndex) => (
        <tr key={`loading-row-${rowIndex}`}>
          {columns.map((column, colIndex) => (
            <td key={`loading-cell-${rowIndex}-${colIndex}`} style={tdStyles}>
              <div style={shimmerStyles}>&nbsp;</div>
            </td>
          ))}
        </tr>
      ));
  };

  return (
    <div style={tableContainerStyles}>
      <table className={`data-table ${className}`} style={tableStyles}>
        <thead style={theadStyles} className={headerClassName}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={`header-${column.key}`}
                style={{ ...thStyles, width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            renderLoadingRows()
          ) : data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={loadingOrEmptyStyles}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id ? `row-${item.id}` : `row-${index}`}
                onClick={() => onRowClick && onRowClick(item, index)}
                style={trStyles(index, selectedRow === index)}
                className={rowClassName ? rowClassName(item, index) : ''}
              >
                {columns.map((column) => (
                  <td key={`cell-${column.key}-${index}`} style={tdStyles}>
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
