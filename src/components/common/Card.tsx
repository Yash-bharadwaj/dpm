import React from 'react';
import { colors, borders, shadows, spacing } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  noPadding = false,
  elevation = 'sm',
  onClick,
  hoverable = false,
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  footer,
}) => {
  // Define shadow based on elevation
  const shadowMap = {
    none: 'none',
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
  };

  const cardStyle = {
    backgroundColor: colors.background.card,
    borderRadius: borders.radiusMd,
    border: borders.standard,
    boxShadow: shadowMap[elevation],
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    cursor: onClick || hoverable ? 'pointer' : 'default',
    overflow: 'hidden',
  };

  const hoverStyles = hoverable
    ? {
        '&:hover': {
          boxShadow: shadows.md,
          transform: 'translateY(-2px)',
        },
      }
    : {};

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md}px ${spacing.md}px`,
    borderBottom: title || subtitle ? borders.standard : 'none',
  };

  const bodyStyle = {
    padding: noPadding ? 0 : `${spacing.md}px`,
  };

  const footerStyle = {
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderTop: borders.standard,
  };

  const titleContainerStyle = {
    flex: 1,
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.neutral.almostBlack,
  };

  const subtitleStyle = {
    margin: '4px 0 0 0',
    fontSize: '0.875rem',
    color: colors.neutral.darkGray,
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
  };

  return (
    <div
      className={`card ${className}`}
      style={Object.assign({}, cardStyle, hoverStyles)}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div className={`card-header ${headerClassName}`} style={headerStyle}>
          <div style={titleContainerStyle}>
            {title && <h5 style={titleStyle}>{title}</h5>}
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>
          {actions && <div style={actionsStyle}>{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`} style={bodyStyle}>
        {children}
      </div>
      {footer && (
        <div className={`card-footer ${footerClassName}`} style={footerStyle}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
