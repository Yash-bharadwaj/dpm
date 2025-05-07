import React, { useEffect } from 'react';
import { colors, shadows, borders, spacing, transitions, zIndex } from '../../theme/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  // Size mapping
  const sizeMap = {
    sm: '300px',
    md: '500px',
    lg: '800px',
    xl: '1000px',
    full: '90%',
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scrolling
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  // Backdrop styles
  const backdropStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.modal,
    animation: `fadeIn ${transitions.duration.short} ${transitions.easing.easeOut}`,
  };

  // Modal content styles
  const modalContentStyle = {
    backgroundColor: colors.background.modal,
    borderRadius: borders.radiusMd,
    boxShadow: shadows.lg,
    width: sizeMap[size],
    maxWidth: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
    animation: `slideIn ${transitions.duration.medium} ${transitions.easing.easeOut}`,
  };

  // Modal header styles
  const modalHeaderStyle = {
    padding: `${spacing.md}px`,
    borderBottom: `1px solid ${colors.neutral.lightGray}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  // Modal title styles
  const modalTitleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.neutral.almostBlack,
  };

  // Close button styles
  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: 0,
    color: colors.neutral.darkGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    transition: `background-color ${transitions.duration.short} ${transitions.easing.easeInOut}`,
    '&:hover': {
      backgroundColor: colors.neutral.lighterGray,
    },
  };

  // Modal body styles
  const modalBodyStyle = {
    padding: `${spacing.md}px`,
    overflow: 'auto',
    flex: 1,
  };

  // Modal footer styles
  const modalFooterStyle = {
    padding: `${spacing.md}px`,
    borderTop: `1px solid ${colors.neutral.lightGray}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: `${spacing.sm}px`,
  };

  // Create CSS keyframes for animations
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;

  // Add keyframes to document
  if (isOpen) {
    const styleTag = document.createElement('style');
    styleTag.id = 'modal-animations';
    styleTag.innerHTML = keyframes;
    
    if (!document.getElementById('modal-animations')) {
      document.head.appendChild(styleTag);
    }
  }

  return (
    <div 
      className={`modal-backdrop ${className}`}
      style={backdropStyle}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div 
        className={`modal-content ${contentClassName}`}
        style={modalContentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={`modal-header ${headerClassName}`} style={modalHeaderStyle}>
            <h5 style={modalTitleStyle}>{title}</h5>
            <button 
              type="button" 
              style={closeButtonStyle} 
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        
        <div className={`modal-body ${bodyClassName}`} style={modalBodyStyle}>
          {children}
        </div>
        
        {footer && (
          <div className={`modal-footer ${footerClassName}`} style={modalFooterStyle}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
