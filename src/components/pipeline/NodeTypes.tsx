import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaUpload, FaEye, FaCode, FaClone, FaBolt } from 'react-icons/fa';
import Badge from '../common/Badge';
import { colors, shadows, borders, spacing } from '../../theme/theme';

// Edge styles
export const customEdgeStyle = {
  stroke: colors.neutral.darkGray,
  strokeWidth: 2,
  opacity: 0.75,
  transition: 'all 0.3s ease',
};

export const selectedEdgeStyle = {
  stroke: colors.primary.main,
  strokeWidth: 3,
  opacity: 1,
  filter: `drop-shadow(0 0 5px ${colors.primary.main}80)`,
};

// Base Node Style
const baseNodeStyle = {
  padding: `${spacing.md}px`,
  borderRadius: borders.radiusMd,
  width: 180,
  fontSize: '14px',
  boxShadow: shadows.md,
  color: colors.neutral.darkerGray,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: 'none',
};

// Node styles for different node types
const sourceNodeStyle = {
  ...baseNodeStyle,
  backgroundColor: colors.pipeline.source,
  borderLeft: `4px solid ${colors.primary.dark}`,
};

const destinationNodeStyle = {
  ...baseNodeStyle,
  backgroundColor: colors.pipeline.destination,
  borderLeft: `4px solid ${colors.status.success}`,
};

const transformNodeStyle = {
  ...baseNodeStyle,
  backgroundColor: colors.pipeline.transform,
  borderLeft: `4px solid ${colors.status.info}`,
};

const functionNodeStyle = {
  ...baseNodeStyle,
  backgroundColor: colors.pipeline.function,
  borderLeft: `4px solid ${colors.status.warning}`,
};

// Handle common styling
const handleStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: colors.neutral.white,
  border: `1px solid ${colors.neutral.darkGray}`,
};

// Source Node Component
const SourceNode = memo(({ data, selected }: NodeProps) => {
  const style = {
    ...sourceNodeStyle,
    boxShadow: selected ? `0 0 0 2px ${colors.primary.main}, ${shadows.md}` : shadows.md,
    transform: selected ? 'translateY(-2px)' : 'none',
  };

  return (
    <div style={style} className="node-container">
      <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="node-icon" style={{ 
            backgroundColor: colors.primary.dark, 
            padding: '6px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.white,
          }}>
            <FaUpload size={12} />
          </div>
          <strong>{data.label}</strong>
        </div>
        <Badge 
          variant={data.status === 'active' ? 'success' : 'light'} 
          size="sm" 
          pill
        >
          {data.status}
        </Badge>
      </div>
      <div className="node-content" style={{ fontSize: '12px', color: colors.neutral.darkGray }}>
        {data.description || 'Data source node'}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
});

// Destination Node Component
const DestinationNode = memo(({ data, selected }: NodeProps) => {
  const style = {
    ...destinationNodeStyle,
    boxShadow: selected ? `0 0 0 2px ${colors.primary.main}, ${shadows.md}` : shadows.md,
    transform: selected ? 'translateY(-2px)' : 'none',
  };

  return (
    <div style={style} className="node-container">
      <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="node-icon" style={{ 
            backgroundColor: colors.status.success, 
            padding: '6px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.white,
          }}>
            <FaEye size={12} />
          </div>
          <strong>{data.label}</strong>
        </div>
        <Badge 
          variant={data.status === 'active' ? 'success' : 'light'} 
          size="sm" 
          pill
        >
          {data.status}
        </Badge>
      </div>
      <div className="node-content" style={{ fontSize: '12px', color: colors.neutral.darkGray }}>
        {data.description || 'Data destination node'}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
});

// Transform Node Component
const TransformNode = memo(({ data, selected }: NodeProps) => {
  const style = {
    ...transformNodeStyle,
    boxShadow: selected ? `0 0 0 2px ${colors.primary.main}, ${shadows.md}` : shadows.md,
    transform: selected ? 'translateY(-2px)' : 'none',
  };

  return (
    <div style={style} className="node-container">
      <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="node-icon" style={{ 
            backgroundColor: colors.status.info, 
            padding: '6px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.white,
          }}>
            <FaCode size={12} />
          </div>
          <strong>{data.label}</strong>
        </div>
        <Badge 
          variant={data.status === 'active' ? 'success' : 'light'} 
          size="sm" 
          pill
        >
          {data.status}
        </Badge>
      </div>
      <div className="node-content" style={{ fontSize: '12px', color: colors.neutral.darkGray }}>
        {data.description || 'Data transformation node'}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
});

// Function Node Component
const FunctionNode = memo(({ data, selected }: NodeProps) => {
  const style = {
    ...functionNodeStyle,
    boxShadow: selected ? `0 0 0 2px ${colors.primary.main}, ${shadows.md}` : shadows.md,
    transform: selected ? 'translateY(-2px)' : 'none',
  };

  return (
    <div style={style} className="node-container">
      <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="node-icon" style={{ 
            backgroundColor: colors.status.warning, 
            padding: '6px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.neutral.darkerGray,
          }}>
            <FaClone size={12} />
          </div>
          <strong>{data.label}</strong>
        </div>
        <Badge 
          variant={data.status === 'active' ? 'success' : 'light'} 
          size="sm" 
          pill
        >
          {data.status}
        </Badge>
      </div>
      <div className="node-content" style={{ fontSize: '12px', color: colors.neutral.darkGray }}>
        {data.description || 'Data processing function'}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
});

// Export the node types for ReactFlow
export const nodeTypes = {
  source: SourceNode,
  destination: DestinationNode,
  transform: TransformNode,
  function: FunctionNode,
};