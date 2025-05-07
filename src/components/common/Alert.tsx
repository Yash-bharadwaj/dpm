import React, { useState } from 'react';
import { colors, typography, borders, spacing, transitions } from '../../theme/theme';

type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  className = '',
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Define colors based on variant
  const getColorsByVariant = (variant: AlertVariant) => {
    const colorMap = {
      success: {
        bg: '#d4edda',
        border: '#c3e6cb',
        text: '#155724',
      },
      warning: {
        bg: '#fff3cd',
        border: '#ffeeba',
        text: '#856404',
      },
      danger: {
        bg: '#f8d7da',
        border: '#f5c6cb',
        text: '#721c24',
      },
      info: {
        bg: '#d1ecf1',
        border: '#bee5eb',
        text: '#0c5460',
      },
    };
    return colorMap[variant];
  };

  const variantColors = getColorsByVariant(variant);

  // Alert styles
  const alertStyle = {
    position: 'relative' as const,
    padding: `${spacing.md}px`,
    marginBottom: `${spacing.md}px`,
    backgroundColor: variantColors.bg,
    border: `1px solid ${variantColors.border}`,
    borderRadius: borders.radiusMd,
    color: variantColors.text,
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${transitions.duration.medium} ${transitions.easing.easeOut}`,
    display: isVisible ? 'block' : 'none',
  };

  // Title styles
  const titleStyle = {
    marginTop: 0,
    marginBottom: title ? spacing.xs : 0,
    fontWeight: typography.fontWeights.semiBold,
    fontSize: typography.fontSizes.lg,
  };

  // Icon styles
  const iconContainerStyle = {
    marginRight: spacing.sm,
    display: 'flex',
    alignItems: 'center',
  };

  // Close button styles
  const closeButtonStyle = {
    position: 'absolute' as const,
    top: spacing.sm,
    right: spacing.sm,
    color: variantColors.text,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.fontSizes.lg,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: `background-color ${transitions.duration.short} ${transitions.easing.easeInOut}`,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  };

  // Content wrapper style
  const contentStyle = {
    display: 'flex',
    alignItems: icon ? 'flex-start' : 'center',
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, parseInt(transitions.duration.medium) * 1000);
    }
  };

  return isVisible ? (
    <div className={`alert alert-${variant} ${className}`} style={alertStyle} role="alert">
      {dismissible && (
        <button 
          type="button" 
          style={closeButtonStyle} 
          onClick={handleClose} 
          aria-label="Close"
        >
          ×
        </button>
      )}
      
      <div style={contentStyle}>
        {icon && <span style={iconContainerStyle}>{icon}</span>}
        <div>
          {title && <h4 style={titleStyle}>{title}</h4>}
          {children}
        </div>
      </div>
    </div>
  ) : null;
};

export default Alert;
