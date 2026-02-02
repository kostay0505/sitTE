import { SPACING, BORDER_RADIUS } from '@/constants/ui';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'completed' | 'pending' | 'error';
  text: string;
}

const getStatusStyles = (status: StatusBadgeProps['status']) => {
  switch (status) {
    case 'active':
      return {
        backgroundColor: '#dcfce7',
        color: '#166534',
      };
    case 'inactive':
      return {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
      };
    case 'completed':
      return {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      };
    case 'pending':
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      };
    case 'error':
      return {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      };
    default:
      return {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
      };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const statusStyles = getStatusStyles(status);

  return (
    <span
      style={{
        ...statusStyles,
        padding: `${SPACING.XS} ${SPACING.SM}`,
        borderRadius: BORDER_RADIUS.SM,
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {text}
    </span>
  );
}; 