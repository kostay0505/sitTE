import { ButtonProps } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS, TRANSITIONS } from '@/constants/ui';

const getVariantStyles = (variant: ButtonProps['variant']) => {
  const baseStyles = {
    border: 'none',
    borderRadius: BORDER_RADIUS.MD,
    cursor: 'pointer',
    fontWeight: '500',
    transition: TRANSITIONS.DEFAULT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.SM,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: COLORS.PRIMARY,
        color: COLORS.WHITE,
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: COLORS.GRAY[100],
        color: COLORS.GRAY[700],
      };
    case 'danger':
      return {
        ...baseStyles,
        backgroundColor: COLORS.ERROR.DARK,
        color: COLORS.WHITE,
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: COLORS.GRAY[600],
        border: `1px solid ${COLORS.GRAY[300]}`,
      };
    default:
      return {
        ...baseStyles,
        backgroundColor: COLORS.PRIMARY,
        color: COLORS.WHITE,
      };
  }
};

const getSizeStyles = (size: ButtonProps['size']) => {
  switch (size) {
    case 'sm':
      return {
        padding: `${SPACING.SM} ${SPACING.MD}`,
        fontSize: '14px',
      };
    case 'lg':
      return {
        padding: `${SPACING.LG} ${SPACING.XXL}`,
        fontSize: '16px',
      };
    default:
      return {
        padding: `${SPACING.MD} ${SPACING.LG}`,
        fontSize: '14px',
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  style,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const buttonStyles = {
    ...variantStyles,
    ...sizeStyles,
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button
      type={type}
      style={buttonStyles}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
}; 