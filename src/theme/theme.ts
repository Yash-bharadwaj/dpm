// Theme configuration for the Cribl-inspired data pipeline manager
// This file contains color schemes, spacing, typography settings, etc.

export const colors = {
  // Primary colors
  primary: {
    main: '#008ac1', // Blue - primary brand color
    light: '#33a1d1',
    dark: '#006d99',
    hover: '#007aad',
    contrastText: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    main: '#546e7a', // Slate gray
    light: '#78909c',
    dark: '#455a64',
    hover: '#607d8b',
    contrastText: '#ffffff',
  },
  
  // Neutral colors - for text, backgrounds, etc.
  neutral: {
    white: '#ffffff',
    offWhite: '#f8f9fa',
    lighterGray: '#e9ecef',
    lightGray: '#dee2e6',
    gray: '#adb5bd',
    darkGray: '#6c757d',
    darkerGray: '#495057',
    almostBlack: '#343a40',
    black: '#212529',
  },
  
  // Status colors
  status: {
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  
  // Pipeline visualization colors
  pipeline: {
    source: '#4caf50', // Green for source nodes
    destination: '#f44336', // Red for destination nodes
    transform: '#ff9800', // Orange for transformation nodes
    function: '#9c27b0', // Purple for function nodes
    connection: '#78909c', // Gray for connections/edges
    selectedNode: '#2196f3', // Blue for selected nodes
    highlightedEdge: '#ffc107', // Yellow for highlighted connections
  },
  
  // Background colors
  background: {
    default: '#ffffff',
    paper: '#f8f9fa',
    navBar: '#ffffff',
    sidebar: '#f8f9fa',
    card: '#ffffff',
    modal: '#ffffff',
  },
};

export const spacing = {
  unit: 8, // Base spacing unit in pixels
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borders = {
  radiusXs: '2px',
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusXl: '16px',
  standard: '1px solid #dee2e6',
  focus: `2px solid ${colors.primary.light}`,
};

export const shadows = {
  sm: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px',
  md: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
  lg: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
  xl: 'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
};

export const typography = {
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem',    // 24px
    h1: '2rem',       // 32px
    h2: '1.75rem',    // 28px
    h3: '1.5rem',     // 24px
    h4: '1.25rem',    // 20px
    h5: '1.125rem',   // 18px
    h6: '1rem',       // 16px
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  lineHeights: {
    xs: 1,
    sm: 1.25,
    md: 1.5,
    lg: 1.75,
    xl: 2,
  },
};

export const transitions = {
  duration: {
    short: '0.15s',
    medium: '0.3s',
    long: '0.5s',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const zIndex = {
  navbar: 1000,
  drawer: 1200,
  modal: 1300,
  tooltip: 1500,
};

// Export the complete theme object
export const theme = {
  colors,
  spacing,
  borders,
  shadows,
  typography,
  transitions,
  zIndex,
};

export default theme;
