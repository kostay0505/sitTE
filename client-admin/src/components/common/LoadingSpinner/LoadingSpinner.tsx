import { COLORS, SPACING } from '@/constants/ui';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const getSizeStyles = (size: LoadingSpinnerProps['size']) => {
  switch (size) {
    case 'sm':
      return { width: '16px', height: '16px' };
    case 'lg':
      return { width: '48px', height: '48px' };
    default:
      return { width: '32px', height: '32px' };
  }
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = COLORS.PRIMARY,
  text,
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.MD,
        padding: SPACING.XL,
      }}
    >
      <div
        style={{
          ...sizeStyles,
          border: `3px solid ${COLORS.GRAY[200]}`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <div
          style={{
            fontSize: '14px',
            color: COLORS.GRAY[600],
            textAlign: 'center',
          }}
        >
          {text}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}; 