import { NotificationProps } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, Z_INDEX } from '@/constants/ui';

const getNotificationStyles = (type: NotificationProps['type']) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: COLORS.SUCCESS.LIGHT,
        color: COLORS.SUCCESS.DARK,
      };
    case 'error':
      return {
        backgroundColor: COLORS.ERROR.LIGHT,
        color: COLORS.ERROR.DARK,
      };
    case 'warning':
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      };
    case 'info':
      return {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      };
    default:
      return {
        backgroundColor: COLORS.SUCCESS.LIGHT,
        color: COLORS.SUCCESS.DARK,
      };
  }
};

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const typeStyles = getNotificationStyles(type);

  return (
    <div
      style={{
        position: 'fixed',
        top: SPACING.XL,
        right: SPACING.XL,
        ...typeStyles,
        padding: `${SPACING.MD} ${SPACING.LG}`,
        borderRadius: BORDER_RADIUS.MD,
        boxShadow: SHADOWS.MD,
        zIndex: Z_INDEX.NOTIFICATION,
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.MD,
      }}
    >
      <span style={{ fontSize: '14px' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'inherit',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}; 