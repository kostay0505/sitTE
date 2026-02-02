import { PaginationData } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/ui';
import { Button } from './ui/Button/Button';

interface PaginationProps {
  paginationData: PaginationData;
  onPrevPage: () => void;
  onNextPage: () => void;
  entityName: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  paginationData,
  onPrevPage,
  onNextPage,
  entityName,
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = paginationData;
  
  if (totalPages <= 1) {
    return null;
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.LG,
      marginTop: SPACING.XL,
      borderTop: `1px solid ${COLORS.GRAY[300]}`,
      backgroundColor: COLORS.GRAY[50],
      borderRadius: `0 0 ${BORDER_RADIUS.MD} ${BORDER_RADIUS.MD}`
    }}>
      <div style={{ fontSize: '14px', color: COLORS.GRAY[600] }}>
        Показано {startIndex}-{endIndex} из {totalItems} {entityName}
      </div>
      
      <div style={{ display: 'flex', gap: SPACING.SM, alignItems: 'center' }}>
        <Button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          variant="ghost"
          size="sm"
        >
          Назад
        </Button>
        
        <span style={{ 
          padding: `0 ${SPACING.SM}`, 
          fontSize: '14px',
          color: COLORS.GRAY[600]
        }}>
          Страница {currentPage} из {totalPages}
        </span>
        
        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          variant="ghost"
          size="sm"
        >
          Вперед
        </Button>
      </div>
    </div>
  );
}; 