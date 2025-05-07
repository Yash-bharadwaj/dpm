import React, { useState } from 'react';
import { colors, typography, borders, spacing, transitions } from '../../theme/theme';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'md',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size variations
  const sizeMap = {
    sm: {
      padding: `${spacing.xs}px ${spacing.sm}px`,
      fontSize: typography.fontSizes.sm,
      height: '32px',
    },
    md: {
      padding: `${spacing.sm}px ${spacing.md}px`,
      fontSize: typography.fontSizes.md,
      height: '40px',
    },
    lg: {
      padding: `${spacing.md}px ${spacing.lg}px`,
      fontSize: typography.fontSizes.lg,
      height: '48px',
    },
  };

  const selectedSize = sizeMap[size];

  // Container styles
  const containerStyle = {
    marginBottom: helperText ? spacing.md : spacing.sm,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative' as const,
  };

  // Label styles
  const labelStyle = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: error ? colors.status.error : colors.neutral.darkerGray,
  };

  // Base input styles
  const getInputStyle = () => {
    const base = {
      width: '100%',
      fontFamily: typography.fontFamily,
      fontSize: selectedSize.fontSize,
      outline: 'none',
      transition: `all ${transitions.duration.short} ${transitions.easing.easeInOut}`,
      backgroundColor: 'transparent',
      paddingLeft: leftIcon ? selectedSize.height : selectedSize.padding,
      paddingRight: rightIcon ? selectedSize.height : selectedSize.padding,
    };

    // Variant specific styles
    switch (variant) {
      case 'filled':
        return {
          ...base,
          backgroundColor: colors.neutral.lighterGray,
          border: 'none',
          borderBottom: `2px solid ${error 
            ? colors.status.error 
            : isFocused 
            ? colors.primary.main 
            : colors.neutral.lightGray}`,
          borderRadius: `${borders.radiusSm} ${borders.radiusSm} 0 0`,
          height: selectedSize.height,
          '&:hover': {
            backgroundColor: colors.neutral.lightGray,
          },
          '&:focus': {
            backgroundColor: colors.neutral.lighterGray,
            borderBottomColor: colors.primary.main,
          },
        };
      case 'standard':
        return {
          ...base,
          border: 'none',
          borderBottom: `1px solid ${error 
            ? colors.status.error 
            : isFocused 
            ? colors.primary.main 
            : colors.neutral.lightGray}`,
          borderRadius: 0,
          padding: `${spacing.xs}px 0`,
          height: 'auto',
          '&:hover': {
            borderBottomColor: colors.neutral.darkGray,
          },
          '&:focus': {
            borderBottomWidth: '2px',
            borderBottomColor: colors.primary.main,
          },
        };
      case 'outlined':
      default:
        return {
          ...base,
          border: `1px solid ${error 
            ? colors.status.error 
            : isFocused 
            ? colors.primary.main 
            : colors.neutral.lightGray}`,
          borderRadius: borders.radiusMd,
          height: selectedSize.height,
          '&:hover': {
            borderColor: colors.neutral.darkGray,
          },
          '&:focus': {
            borderColor: colors.primary.main,
            boxShadow: `0 0 0 2px ${colors.primary.light}30`,
          },
        };
    }
  };

  // Helper text styles
  const helperTextStyle = {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs / 2,
    color: error ? colors.status.error : colors.neutral.darkGray,
  };

  // Icon styles
  const iconStyle = (isLeft: boolean) => ({
    position: 'absolute' as const,
    top: label ? 'auto' : '50%',
    [isLeft ? 'left' : 'right']: variant === 'standard' ? 0 : spacing.sm,
    transform: 'translateY(-50%)',
    color: error 
      ? colors.status.error 
      : isFocused 
      ? colors.primary.main 
      : colors.neutral.darkGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  });

  // Calculate icon position based on whether label exists
  const iconTop = label ? `calc(${selectedSize.height} / 2 + ${labelStyle.marginBottom + parseInt(labelStyle.fontSize)}px)` : '50%';

  return (
    <div className={`text-field-container ${containerClassName}`} style={containerStyle}>
      {label && (
        <label 
          htmlFor={rest.id} 
          className={`text-field-label ${labelClassName}`} 
          style={labelStyle}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div 
            className="text-field-left-icon" 
            style={{ ...iconStyle(true), top: iconTop }}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          className={`text-field ${variant} ${inputClassName} ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            if (rest.onFocus) rest.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (rest.onBlur) rest.onBlur(e);
          }}
          style={getInputStyle()}
          {...rest}
        />
        
        {rightIcon && (
          <div 
            className="text-field-right-icon" 
            style={{ ...iconStyle(false), top: iconTop }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      
      {helperText && (
        <div 
          className={`text-field-helper-text ${helperTextClassName}`} 
          style={helperTextStyle}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextField;
