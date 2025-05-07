import React from 'react';
import { colors, typography, borders, spacing, transitions } from '../../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  // Base styles for all buttons
  const baseStyles = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${typography.fontFamily};
    font-weight: ${typography.fontWeights.medium};
    border-radius: ${borders.radiusMd};
    transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
    cursor: pointer;
    outline: none;
    border: none;
    position: relative;
    ${disabled || isLoading ? 'opacity: 0.6; cursor: not-allowed;' : ''}
    ${fullWidth ? 'width: 100%;' : ''}
  `;

  // Size variations
  const sizeStyles = {
    sm: `
      padding: ${spacing.xs}px ${spacing.sm}px;
      font-size: ${typography.fontSizes.sm};
    `,
    md: `
      padding: ${spacing.sm}px ${spacing.md}px;
      font-size: ${typography.fontSizes.md};
    `,
    lg: `
      padding: ${spacing.md}px ${spacing.lg}px;
      font-size: ${typography.fontSizes.lg};
    `,
  };

  // Variant styles
  const variantStyles = {
    primary: `
      background-color: ${colors.primary.main};
      color: ${colors.primary.contrastText};
      &:hover:not(:disabled) {
        background-color: ${colors.primary.hover};
      }
      &:active:not(:disabled) {
        background-color: ${colors.primary.dark};
      }
    `,
    secondary: `
      background-color: ${colors.secondary.main};
      color: ${colors.secondary.contrastText};
      &:hover:not(:disabled) {
        background-color: ${colors.secondary.hover};
      }
      &:active:not(:disabled) {
        background-color: ${colors.secondary.dark};
      }
    `,
    outline: `
      background-color: transparent;
      color: ${colors.primary.main};
      border: 1px solid ${colors.primary.main};
      &:hover:not(:disabled) {
        background-color: ${colors.neutral.lighterGray};
      }
      &:active:not(:disabled) {
        background-color: ${colors.neutral.lightGray};
      }
    `,
    text: `
      background-color: transparent;
      color: ${colors.primary.main};
      padding-left: ${spacing.xs}px;
      padding-right: ${spacing.xs}px;
      &:hover:not(:disabled) {
        background-color: ${colors.neutral.lighterGray};
      }
      &:active:not(:disabled) {
        background-color: ${colors.neutral.lightGray};
      }
    `,
    danger: `
      background-color: ${colors.status.error};
      color: ${colors.neutral.white};
      &:hover:not(:disabled) {
        background-color: #c82333;
      }
      &:active:not(:disabled) {
        background-color: #bd2130;
      }
    `,
  };

  // Icon styles
  const iconSpacing = size === 'sm' ? spacing.xs : spacing.sm;
  const leftIconStyle = leftIcon ? `margin-right: ${iconSpacing}px;` : '';
  const rightIconStyle = rightIcon ? `margin-left: ${iconSpacing}px;` : '';

  // Loading spinner
  const loadingSpinner = (
    <div className="spinner" style={{ marginRight: spacing.xs }}>
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Combined styles
  const combinedStyle = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
  `;

  return (
    <button
      className={`custom-button ${variant} ${size} ${className}`}
      disabled={disabled || isLoading}
      style={{ cssText: combinedStyle }}
      {...rest}
    >
      {isLoading && loadingSpinner}
      {!isLoading && leftIcon && <span style={{ cssText: leftIconStyle }}>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span style={{ cssText: rightIconStyle }}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
