import { FormFieldProps } from '@/types/common';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/ui';

interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'datetime-local' | 'file';
  name: string;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  accept?: string;
  autoComplete?: string;
}

interface TextareaProps extends FormFieldProps {
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
}

const fieldBaseStyles = {
  width: '100%',
  padding: `${SPACING.MD} ${SPACING.LG}`,
  border: `1px solid ${COLORS.GRAY[300]}`,
  borderRadius: BORDER_RADIUS.MD,
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  helpText,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  disabled,
  accept,
  autoComplete,
  style,
}) => {
  const inputStyles = {
    ...fieldBaseStyles,
    borderColor: error ? COLORS.ERROR.DARK : COLORS.GRAY[300],
    backgroundColor: disabled ? COLORS.GRAY[50] : COLORS.WHITE,
    ...style,
  };

  return (
    <div style={{ marginBottom: SPACING.LG }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: SPACING.SM,
            fontSize: '14px',
            fontWeight: '500',
            color: COLORS.GRAY[700],
          }}
        >
          {label}
          {required && <span style={{ color: COLORS.ERROR.DARK }}>*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        autoComplete={autoComplete}
        style={inputStyles}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.PRIMARY;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? COLORS.ERROR.DARK : COLORS.GRAY[300];
        }}
      />
      
      {error && (
        <div
          style={{
            marginTop: SPACING.XS,
            fontSize: '12px',
            color: COLORS.ERROR.DARK,
          }}
        >
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div
          style={{
            marginTop: SPACING.XS,
            fontSize: '12px',
            color: COLORS.GRAY[500],
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  required,
  helpText,
  name,
  value,
  placeholder,
  onChange,
  disabled,
  rows = 3,
  style,
}) => {
  const textareaStyles = {
    ...fieldBaseStyles,
    borderColor: error ? COLORS.ERROR.DARK : COLORS.GRAY[300],
    backgroundColor: disabled ? COLORS.GRAY[50] : COLORS.WHITE,
    resize: 'vertical' as const,
    minHeight: `${rows * 24}px`,
    ...style,
  };

  return (
    <div style={{ marginBottom: SPACING.LG }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: SPACING.SM,
            fontSize: '14px',
            fontWeight: '500',
            color: COLORS.GRAY[700],
          }}
        >
          {label}
          {required && <span style={{ color: COLORS.ERROR.DARK }}>*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        style={textareaStyles}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.PRIMARY;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? COLORS.ERROR.DARK : COLORS.GRAY[300];
        }}
      />
      
      {error && (
        <div
          style={{
            marginTop: SPACING.XS,
            fontSize: '12px',
            color: COLORS.ERROR.DARK,
          }}
        >
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div
          style={{
            marginTop: SPACING.XS,
            fontSize: '12px',
            color: COLORS.GRAY[500],
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
}; 