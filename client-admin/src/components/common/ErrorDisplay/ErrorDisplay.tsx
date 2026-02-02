import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/ui';
import { Button } from '../../ui/Button/Button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = 'Произошла ошибка',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${SPACING.XXL} ${SPACING.LG}`,
        backgroundColor: COLORS.ERROR.LIGHT,
        border: `1px solid ${COLORS.ERROR.DARK}`,
        borderRadius: BORDER_RADIUS.MD,
        margin: SPACING.LG,
        textAlign: 'center',
      }}
    >
      <h3
        style={{
          margin: `0 0 ${SPACING.MD} 0`,
          color: COLORS.ERROR.DARK,
          fontSize: '18px',
        }}
      >
        {title}
      </h3>
      
      <p
        style={{
          margin: `0 0 ${SPACING.LG} 0`,
          color: COLORS.ERROR.DARK,
          fontSize: '14px',
        }}
      >
        {error}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="danger">
          Повторить попытку
        </Button>
      )}
    </div>
  );
}; 