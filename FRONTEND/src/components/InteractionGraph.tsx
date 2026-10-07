import React, { useState, useMemo, useRef } from 'react';
import {
  InteractionGraphData,
  GraphNode,
  GraphEdge,
  InteractionSeverity,
  SupportedLanguage,
} from '../types/interactions';
import { t } from '../utils/localization';
import { ZoomIn, ZoomOut, RotateCcw, Pill, Utensils } from 'lucide-react';

interface InteractionGraphProps {
  data: InteractionGraphData;
  currentLanguage: SupportedLanguage;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge?: (edge: GraphEdge) => void;
}

const SEVERITY_COLORS: Record<InteractionSeverity, { line: string; fill: string; border: string; label: string }> = {
  LOW: { line: '#059669', fill: '#ecfdf5', border: '#10b981', label: 'Low' },
  MODERATE: { line: '#d97706', fill: '#fffbeb', border: '#f59e0b', label: 'Moderate' },
  HIGH: { line: '#ea580c', fill: '#fff7ed', border: '#f97316', label: 'High' },
  CRITICAL: { line: '#dc2626', fill: '#fef2f2', border: '#ef4444', label: 'Critical' },
};

export const InteractionGraph: React.FC<InteractionGraphProps> = ({
  data,
  currentLanguage,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Center coordinate of SVG canvas
  const CANVAS_WIDTH = 760;
  const CANVAS_HEIGHT = 480;
  const CENTER_X = CANVAS_WIDTH / 2;
  const CENTER_Y = CANVAS_HEIGHT / 2;
  const RADIUS = 180;

  // Compute radial layout positions for satellite nodes
  const layout = useMemo(() => {
    const primaryNode = data.nodes.find((n) => n.type === 'PRIMARY_DRUG') || data.nodes[0];
    const peripheralNodes = data.nodes.filter((n) => n.id !== primaryNode?.id);

    const positions: Record<string, { x: number; y: number }> = {};

    if (primaryNode) {
      positions[primaryNode.id] = { x: CENTER_X, y: CENTER_Y };
    }

    const totalPeripheral = peripheralNodes.length;
    peripheralNodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / (totalPeripheral || 1) - Math.PI / 2;
      positions[node.id] = {
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
      };
    });

    return { primaryNode, peripheralNodes, positions };
  }, [data]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!data.nodes || data.nodes.length === 0) {
    return (
      <div
        style={{
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p>{t('emptyStatePrompt', currentLanguage)}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Top Header / Graph Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {t('graphTab', currentLanguage)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
            ({data.nodes.length} entities, {data.edges.length} interactions)
          </span>
        </div>

        {/* Zoom & Reset Controls */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
            title="Zoom In"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            title="Zoom Out"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Reset View"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        style={{
          width: '100%',
          height: '460px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#fafbfc',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin={`${CENTER_X} ${CENTER_Y}`}>
          {/* Subtle Background Radial Grid Rings */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke="#e2e8f0" strokeDasharray="4 4" />
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS * 0.5} fill="none" stroke="#f1f5f9" />

          {/* Interaction Connecting Edges */}
          {data.edges.map((edge) => {
            const sourcePos = layout.positions[edge.source];
            const targetPos = layout.positions[edge.target];
            if (!sourcePos || !targetPos) return null;

            const sevConfig = SEVERITY_COLORS[edge.severity] || SEVERITY_COLORS.LOW;
            const isCritical = edge.severity === 'CRITICAL';

            return (
              <g
                key={edge.id}
                onClick={() => onSelectEdge?.(edge)}
                style={{ cursor: 'pointer' }}
              >
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={sevConfig.line}
                  strokeWidth={isCritical ? 3.5 : 2}
                  strokeDasharray={isCritical ? '6 3' : 'none'}
                  opacity={0.85}
                />
                {/* Edge midpoint badge */}
                <circle
                  cx={(sourcePos.x + targetPos.x) / 2}
                  cy={(sourcePos.y + targetPos.y) / 2}
                  r={8}
                  fill={sevConfig.fill}
                  stroke={sevConfig.border}
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {/* Satellite Nodes (Interacting Drugs & Foods) */}
          {layout.peripheralNodes.map((node) => {
            const pos = layout.positions[node.id];
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const sevConfig = node.severity ? SEVERITY_COLORS[node.severity] : SEVERITY_COLORS.LOW;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectNode(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer halo on selection or critical severity */}
                {isSelected && (
                  <circle r={36} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeDasharray="3 3" />
                )}
                <circle
                  r={28}
                  fill={sevConfig.fill}
                  stroke={sevConfig.border}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}
                />

                {/* Node Icon */}
                <foreignObject x={-12} y={-12} width={24} height={24}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {node.type === 'FOOD' ? (
                      <Utensils size={16} color={sevConfig.line} />
                    ) : (
                      <Pill size={16} color={sevConfig.line} />
                    )}
                  </div>
                </foreignObject>

                {/* Label text */}
                <text
                  y={42}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--color-text-main)"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label}
                </text>
                <text
                  y={55}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--color-text-muted)"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.severity ? `${sevConfig.label}` : node.type}
                </text>
              </g>
            );
          })}

          {/* Central Anchor Node (Primary Searched Medicine) */}
          {layout.primaryNode && (
            <g
              transform={`translate(${CENTER_X}, ${CENTER_Y})`}
              onClick={() => onSelectNode(layout.primaryNode)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={44}
                fill="var(--color-primary-light)"
                stroke="var(--color-primary)"
                strokeWidth={3}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(13, 148, 136, 0.2))' }}
              />
              <foreignObject x={-14} y={-14} width={28} height={28}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Pill size={22} color="var(--color-primary)" />
                </div>
              </foreignObject>
              <text
                y={62}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="var(--color-text-main)"
                style={{ pointerEvents: 'none' }}
              >
                {layout.primaryNode.label}
              </text>
              <text
                y={76}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill="var(--color-primary)"
                style={{ pointerEvents: 'none' }}
              >
                Primary Medicine
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Bottom Severity & Node Type Legend */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '10px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#ffffff',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Severity:</span>
          {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as InteractionSeverity[]).map((sev) => {
            const conf = SEVERITY_COLORS[sev];
            return (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: conf.line,
                  }}
                />
                <span>{conf.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Pill size={14} color="var(--color-primary)" />
            <span>Drug</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Utensils size={14} color="#ea580c" />
            <span>Food / Dietary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
