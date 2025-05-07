import React from 'react';
import { colors, typography, borders, spacing } from '../../theme/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  outline?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  outline = false,
  icon,
  className = '',
}) => {
  // Colors based on variant
  const getColorsByVariant = (variant: BadgeVariant) => {
    const colorMap = {
      primary: {
        bg: colors.primary.main,
        text: colors.primary.contrastText,
        border: colors.primary.main,
      },
      secondary: {
        bg: colors.secondary.main,
        text: colors.secondary.contrastText,
        border: colors.secondary.main,
      },
      success: {
        bg: colors.status.success,
        text: colors.neutral.white,
        border: colors.status.success,
      },
      warning: {
        bg: colors.status.warning,
        text: colors.neutral.darkerGray,
        border: colors.status.warning,
      },
      danger: {
        bg: colors.status.error,
        text: colors.neutral.white,
        border: colors.status.error,
      },
      info: {
        bg: colors.status.info,
        text: colors.neutral.white,
        border: colors.status.info,
      },
      light: {
        bg: colors.neutral.lighterGray,
        text: colors.neutral.darkerGray,
        border: colors.neutral.lightGray,
      },
      dark: {
        bg: colors.neutral.darkerGray,
        text: colors.neutral.white,
        border: colors.neutral.darkerGray,
      },
    };
    return colorMap[variant];
  };

  const variantColors = getColorsByVariant(variant);

  // Size styles
  const sizeStyles = {
    sm: {
      padding: `${spacing.xs / 2}px ${spacing.xs}px`,
      fontSize: typography.fontSizes.xs,
    },
    md: {
      padding: `${spacing.xs}px ${spacing.sm}px`,
      fontSize: typography.fontSizes.sm,
    },
    lg: {
      padding: `${spacing.sm / 2}px ${spacing.sm}px`,
      fontSize: typography.fontSizes.md,
    },
  };

  // Base badge styles
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: outline ? 'transparent' : variantColors.bg,
    color: outline ? variantColors.bg : variantColors.text,
    border: outline ? `1px solid ${variantColors.border}` : 'none',
    borderRadius: pill ? '50px' : borders.radiusSm,
    fontWeight: typography.fontWeights.medium,
    lineHeight: 1,
    whiteSpace: 'nowrap' as const,
    ...sizeStyles[size],
  };

  // Icon styles
  const iconStyle = {
    marginRight: icon ? spacing.xs : 0,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <span className={`badge badge-${variant} ${className}`} style={badgeStyle}>
      {icon && <span style={iconStyle}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
