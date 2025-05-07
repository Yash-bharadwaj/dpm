import React from 'react';
import { colors, borders, shadows, typography } from '../../theme/theme';
import { Handle, Position, NodeProps } from 'reactflow';

// Types for different pipeline nodes
export type NodeData = {
  label: string;
  icon?: React.ReactNode;
  description?: string;
  status?: 'active' | 'inactive' | 'error' | 'warning';
  info?: Record<string, any>;
};

// Base styles for all nodes
const nodeBaseStyle = {
  padding: '10px 12px',
  borderRadius: borders.radiusMd,
  boxShadow: shadows.sm,
  fontSize: typography.fontSizes.sm,
  fontWeight: typography.fontWeights.medium,
  width: '180px',
  display: 'flex',
  flexDirection: 'column' as const,
  transition: 'all 0.2s ease',
};

// Status indicator styles
const statusIndicatorStyle = (status?: string) => {
  const statusColors = {
    active: colors.status.success,
    inactive: colors.neutral.gray,
    error: colors.status.error,
    warning: colors.status.warning,
  };

  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: status ? statusColors[status as keyof typeof statusColors] : statusColors.inactive,
    marginRight: '6px',
  };
};

// Common header style for nodes
const nodeHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '6px',
};

// Title style for nodes
const nodeTitleStyle = {
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  flex: 1,
};

// Description style for nodes
const descriptionStyle = {
  fontSize: typography.fontSizes.xs,
  color: colors.neutral.darkGray,
  margin: '4px 0 0 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
};

// Icon container style
const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '8px',
  fontSize: '14px',
};

// Handle styles for connections
const handleStyle = {
  background: colors.primary.main,
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  border: `2px solid ${colors.neutral.white}`,
};

// Source Node (starting point of the pipeline)
export const SourceNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        ...nodeBaseStyle,
        backgroundColor: colors.pipeline.source + '10',
        borderColor: colors.pipeline.source,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '4px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? shadows.md : shadows.sm,
      }}
    >
      <div style={nodeHeaderStyle}>
        {data.icon && <div style={iconStyle}>{data.icon}</div>}
        <div style={statusIndicatorStyle(data.status)} />
        <h4 style={nodeTitleStyle}>{data.label}</h4>
      </div>
      {data.description && <p style={descriptionStyle}>{data.description}</p>}
      
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        id="source-right"
      />
    </div>
  );
};

// Destination Node (endpoint of the pipeline)
export const DestinationNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        ...nodeBaseStyle,
        backgroundColor: colors.pipeline.destination + '10',
        borderColor: colors.pipeline.destination,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '4px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? shadows.md : shadows.sm,
      }}
    >
      <div style={nodeHeaderStyle}>
        {data.icon && <div style={iconStyle}>{data.icon}</div>}
        <div style={statusIndicatorStyle(data.status)} />
        <h4 style={nodeTitleStyle}>{data.label}</h4>
      </div>
      {data.description && <p style={descriptionStyle}>{data.description}</p>}
      
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        id="target-left"
      />
    </div>
  );
};

// Transform Node (transformation processes in the pipeline)
export const TransformNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        ...nodeBaseStyle,
        backgroundColor: colors.pipeline.transform + '10',
        borderColor: colors.pipeline.transform,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '4px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? shadows.md : shadows.sm,
      }}
    >
      <div style={nodeHeaderStyle}>
        {data.icon && <div style={iconStyle}>{data.icon}</div>}
        <div style={statusIndicatorStyle(data.status)} />
        <h4 style={nodeTitleStyle}>{data.label}</h4>
      </div>
      {data.description && <p style={descriptionStyle}>{data.description}</p>}
      
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        id="target-left"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        id="source-right"
      />
    </div>
  );
};

// Function Node (for processing data with functions)
export const FunctionNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      style={{
        ...nodeBaseStyle,
        backgroundColor: colors.pipeline.function + '10',
        borderColor: colors.pipeline.function,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '4px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? shadows.md : shadows.sm,
      }}
    >
      <div style={nodeHeaderStyle}>
        {data.icon && <div style={iconStyle}>{data.icon}</div>}
        <div style={statusIndicatorStyle(data.status)} />
        <h4 style={nodeTitleStyle}>{data.label}</h4>
      </div>
      {data.description && <p style={descriptionStyle}>{data.description}</p>}
      
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        id="target-left"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        id="source-right"
      />
    </div>
  );
};

// Edge styles for connections
export const customEdgeStyle = {
  stroke: colors.pipeline.connection,
  strokeWidth: 2,
  transition: 'stroke 0.3s, stroke-width 0.3s',
};

export const selectedEdgeStyle = {
  ...customEdgeStyle,
  stroke: colors.pipeline.highlightedEdge,
  strokeWidth: 3,
};

// Export node types mapping for React Flow
export const nodeTypes = {
  source: SourceNode,
  destination: DestinationNode,
  transform: TransformNode,
  function: FunctionNode,
};
