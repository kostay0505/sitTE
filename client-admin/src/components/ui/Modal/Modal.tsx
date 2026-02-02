import { ModalProps } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS, Z_INDEX } from '@/constants/ui';
import { Button } from '../Button/Button';

const getSizeStyles = (size: ModalProps['size']) => {
  switch (size) {
    case 'sm':
      return { width: '90%', maxWidth: '400px' };
    case 'lg':
      return { width: '90%', maxWidth: '800px' };
    case 'xl':
      return { width: '90%', maxWidth: '1200px' };
    default:
      return { width: '90%', maxWidth: '600px' };
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeStyles = getSizeStyles(size);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: Z_INDEX.MODAL_BACKDROP,
        backdropFilter: 'blur(4px)',
        transition: TRANSITIONS.SLOW,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.WHITE,
          borderRadius: BORDER_RADIUS.LG,
          ...sizeStyles,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: SHADOWS.LG,
          zIndex: Z_INDEX.MODAL,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              padding: SPACING.XL,
              borderBottom: `1px solid ${COLORS.GRAY[200]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        )}
        
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: SPACING.XL,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}; 