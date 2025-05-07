import React from 'react';
import { colors, transitions } from '../../theme/theme';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  isFullPage?: boolean;
  text?: string;
  transparent?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = colors.primary.main,
  className = '',
  isFullPage = false,
  text,
  transparent = false,
  variant = 'spinner',
}) => {
  // Size mapping
  const sizeMap = {
    sm: {
      size: 16,
      borderWidth: 2,
      textSize: '0.75rem',
    },
    md: {
      size: 32,
      borderWidth: 3,
      textSize: '0.875rem',
    },
    lg: {
      size: 48,
      borderWidth: 4,
      textSize: '1rem',
    },
  };

  const selectedSize = sizeMap[size];

  // Create CSS keyframes for animations
  const spinnerKeyframes = `
    @keyframes spinner-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const dotsKeyframes = `
    @keyframes dots-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `;

  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.5; }
      50% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.8); opacity: 0.5; }
    }
  `;

  // Add all keyframes to document
  const styleTag = document.createElement('style');
  styleTag.id = 'loader-animations';
  styleTag.innerHTML = spinnerKeyframes + dotsKeyframes + pulseKeyframes;
  
  if (!document.getElementById('loader-animations')) {
    document.head.appendChild(styleTag);
  }

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (isFullPage) {
    Object.assign(containerStyle, {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: transparent ? 'rgba(255, 255, 255, 0.7)' : colors.background.default,
      zIndex: 9999,
    });
  }

  // Text styles
  const textStyle = {
    marginTop: '12px',
    color: colors.neutral.darkGray,
    fontSize: selectedSize.textSize,
  };

  // Render appropriate loader variant
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            style={{
              width: `${selectedSize.size}px`,
              height: `${selectedSize.size}px`,
              border: `${selectedSize.borderWidth}px solid ${color}20`,
              borderTop: `${selectedSize.borderWidth}px solid ${color}`,
              borderRadius: '50%',
              animation: `spinner-rotate 1s linear infinite`,
            }}
          />
        );

      case 'dots':
        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: `${selectedSize.size / 3}px`,
                  height: `${selectedSize.size / 3}px`,
                  backgroundColor: color,
                  borderRadius: '50%',
                  animation: `dots-bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            style={{
              width: `${selectedSize.size}px`,
              height: `${selectedSize.size}px`,
              backgroundColor: color,
              borderRadius: '50%',
              animation: `pulse 1.5s ease-in-out infinite`,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`loader ${className}`} style={containerStyle}>
      {renderLoader()}
      {text && <div style={textStyle}>{text}</div>}
    </div>
  );
};

export default Loader;
