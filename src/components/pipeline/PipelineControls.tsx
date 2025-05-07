import React from 'react';
import { Node, Edge } from 'reactflow';
import { DragEvent } from 'react';
import { colors, shadows, borders, spacing, typography } from '../../theme/theme';
import Button from '../common/Button';
import Card from '../common/Card';

// Types for the draggable node items
interface NodeItem {
  type: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface PipelineControlsProps {
  onAddNode?: (type: string, position: { x: number; y: number }) => void;
  onClearPipeline?: () => void;
  onSavePipeline?: () => void;
  onLoadPipeline?: () => void;
  nodeItems: NodeItem[];
  isReadOnly?: boolean;
  className?: string;
}

const PipelineControls: React.FC<PipelineControlsProps> = ({
  onAddNode,
  onClearPipeline,
  onSavePipeline,
  onLoadPipeline,
  nodeItems,
  isReadOnly = false,
  className = '',
}) => {
  // Handle drag start for a node item
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    // Add node data to the drag event
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Node item styles
  const nodeItemStyle = {
    padding: `${spacing.sm}px`,
    marginBottom: `${spacing.sm}px`,
    backgroundColor: colors.background.card,
    borderRadius: borders.radiusSm,
    cursor: 'grab',
    transition: 'all 0.2s ease',
    border: `1px solid ${colors.neutral.lightGray}`,
    '&:hover': {
      boxShadow: shadows.sm,
      borderColor: colors.primary.light,
    },
  };

  // Color mapping for node types
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'source':
        return colors.pipeline.source;
      case 'destination':
        return colors.pipeline.destination;
      case 'transform':
        return colors.pipeline.transform;
      case 'function':
        return colors.pipeline.function;
      default:
        return colors.neutral.darkGray;
    }
  };

  // Node item card styles based on type
  const getNodeItemStyles = (type: string) => ({
    ...nodeItemStyle,
    borderLeftColor: getNodeColor(type),
    borderLeftWidth: '4px',
  });

  return (
    <div className={`pipeline-controls ${className}`}>
      <Card 
        title="Pipeline Components" 
        elevation="sm"
        noPadding={false}
      >
        <div className="node-items" style={{ marginBottom: spacing.md }}>
          {nodeItems.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              draggable={!isReadOnly}
              onDragStart={(event) => onDragStart(event, item.type)}
              style={getNodeItemStyles(item.type)}
              className="node-item"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {item.icon && (
                  <div style={{ marginRight: spacing.sm, color: getNodeColor(item.type) }}>
                    {item.icon}
                  </div>
                )}
                <div>
                  <h4 style={{ 
                    margin: 0,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.semiBold,
                  }}>
                    {item.label}
                  </h4>
                  {item.description && (
                    <p style={{ 
                      margin: '4px 0 0 0',
                      fontSize: typography.fontSizes.xs,
                      color: colors.neutral.darkGray,
                    }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!isReadOnly && (
          <div className="pipeline-actions" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: spacing.sm 
          }}>
            {onSavePipeline && (
              <Button 
                variant="primary" 
                onClick={onSavePipeline}
                fullWidth
              >
                Save Pipeline
              </Button>
            )}
            
            {onLoadPipeline && (
              <Button 
                variant="outline" 
                onClick={onLoadPipeline}
                fullWidth
              >
                Load Pipeline
              </Button>
            )}
            
            {onClearPipeline && (
              <Button 
                variant="text" 
                onClick={onClearPipeline}
                fullWidth
              >
                Clear Pipeline
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PipelineControls;
