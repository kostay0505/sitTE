import { useEffect } from 'react';
import { BaseEntity, TableColumn, LoadingState } from '@/types/common';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { usePageTitle } from '@/components/AuthWrapper';
import { SPACING } from '@/constants/ui';
import { LoadingSpinner } from '../common/LoadingSpinner/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay/ErrorDisplay';
import { Button } from '../ui/Button/Button';
import { Table } from '../ui/Table/Table';

interface AdminTableProps<T extends BaseEntity> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  loadingState: LoadingState;
  itemsPerPage?: number;
  entityName: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  createButtonText?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  }[];
  expandable?: boolean;
  renderExpandedContent?: (item: T) => React.ReactNode;
  isRowExpandable?: (item: T) => boolean;
  expandedRows?: Set<string | number>;
  onToggleExpand?: (itemId: string | number) => void;
}

export function AdminTable<T extends BaseEntity>({
  title,
  data,
  columns,
  loadingState,
  itemsPerPage = 10,
  entityName,
  emptyMessage,
  onRowClick,
  onRefresh,
  onCreateNew,
  createButtonText = 'Создать',
  actions = [],
  expandable = false,
  renderExpandedContent,
  isRowExpandable,
  expandedRows,
  onToggleExpand,
}: AdminTableProps<T>) {
  const { setPageTitle } = usePageTitle();

  // Устанавливаем заголовок страницы при монтировании компонента
  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  const { paginationData, currentItems, goToPrevPage, goToNextPage } = usePagination(
    data,
    {
      totalItems: data.length,
      itemsPerPage,
    }
  );

  const { isLoading, error } = loadingState;

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Загрузка данных..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRefresh} />;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: SPACING.XXL,
        }}
      >
        <div style={{ display: 'flex', gap: SPACING.MD }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'secondary'}
            >
              {action.label}
            </Button>
          ))}

          {onRefresh && (
            <Button onClick={onRefresh} variant="ghost">
              Обновить
            </Button>
          )}

          {onCreateNew && (
            <Button onClick={onCreateNew} variant="primary">
              {createButtonText}
            </Button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '1000px' }}>
          <Table
            columns={columns}
            data={currentItems}
            onRowClick={onRowClick}
            emptyMessage={emptyMessage}
            expandable={expandable}
            renderExpandedContent={renderExpandedContent}
            isRowExpandable={isRowExpandable}
            expandedRows={expandedRows}
            onToggleExpand={onToggleExpand}
          />
        </div>
      </div>

      <Pagination
        paginationData={paginationData}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        entityName={entityName}
      />
    </div>
  );
} 