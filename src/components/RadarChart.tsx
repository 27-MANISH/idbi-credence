'use client';

import React, { useState } from 'react';

export interface RadarDimension {
  key: string;
  label: string;
  val: number; // 0-100
  color?: string;
  desc?: string;
}

interface RadarChartProps {
  dimensions: RadarDimension[];
  size?: number;
  /** Whether the company is flagged (changes polygon fill to red) */
  isFlagged?: boolean;
  showBenchmark?: boolean;
  benchmarkVal?: number; // 0-100, default 70
  onHover?: (key: string | null) => void;
}

export default function RadarChart({
  dimensions,
  size = 280,
  isFlagged = false,
  showBenchmark = true,
  benchmarkVal = 70,
  onHover,
}: RadarChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34; // ~95px for 280 viewport
  const n = dimensions.length;

  const getCoords = (val: number, i: number) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: cx + r * (val / 100) * Math.cos(angle),
      y: cy + r * (val / 100) * Math.sin(angle),
    };
  };

  const ringPolygons = [20, 40, 60, 80, 100].map((level) =>
    dimensions
      .map((_, i) => {
        const { x, y } = getCoords(level, i);
        return `${x},${y}`;
      })
      .join(' ')
  );

  const dataPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoords(d.val, i);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPoints = dimensions
    .map((_, i) => {
      const { x, y } = getCoords(benchmarkVal, i);
      return `${x},${y}`;
    })
    .join(' ');

  const fillColor = isFlagged ? 'rgba(239, 68, 68, 0.15)' : 'rgba(1, 105, 111, 0.15)';
  const strokeColor = isFlagged ? '#ef4444' : '#01696f';
  const dotFill = isFlagged ? '#ef4444' : '#01696f';

  const handleHover = (key: string | null) => {
    setHoveredKey(key);
    onHover?.(key);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[320px]">
        {/* Concentric guide rings */}
        {ringPolygons.map((pts, idx) => (
          <polygon
            key={`ring-${idx}`}
            points={pts}
            fill="none"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="1"
            strokeDasharray={idx === 4 ? 'none' : '3,3'}
          />
        ))}

        {/* Scale labels */}
        {[20, 40, 60, 80, 100].map((level, idx) => (
          <text
            key={`label-${idx}`}
            x={cx + 4}
            y={cy - (r * level) / 100 + 3}
            fontSize="7"
            fontFamily="JetBrains Mono, monospace"
            fill="rgba(121,120,118,0.7)"
            fontWeight="600"
          >
            {level}%
          </text>
        ))}

        {/* Spoke lines */}
        {dimensions.map((_, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isHov = hoveredKey === dimensions[i].key;
          return (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={isHov ? strokeColor : 'rgba(148,163,184,0.4)'}
              strokeWidth={isHov ? 1.5 : 1}
            />
          );
        })}

        {/* Benchmark ring */}
        {showBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="rgba(148, 163, 184, 0.05)"
            stroke="rgba(148, 163, 184, 0.6)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        )}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.2"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Axis labels & vertex dots */}
        {dimensions.map((d, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          const { x, y } = getCoords(d.val, i);
          const labelX = cx + (r + 18) * Math.cos(angle);
          const labelY = cy + (r + 14) * Math.sin(angle);
          const isHov = hoveredKey === d.key;

          return (
            <g
              key={`vertex-${d.key}`}
              onMouseEnter={() => handleHover(d.key)}
              onMouseLeave={() => handleHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x}
                cy={y}
                r={isHov ? 5.5 : 3.5}
                fill={dotFill}
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: 'r 0.15s ease' }}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isHov ? '700' : '600'}
                fill={isHov ? strokeColor : 'rgba(40,37,29,0.7)'}
                style={{ transition: 'fill 0.15s ease', userSelect: 'none' }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {hoveredKey && (() => {
        const active = dimensions.find(d => d.key === hoveredKey);
        if (!active) return null;
        return (
          <div className="w-full bg-fin-surface-2 border border-gray-200/40 rounded-lg px-3 py-2 text-center animate-fade-in">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: strokeColor }}>
              {active.label}
            </span>
            <span className="text-[10px] font-mono text-fin-text-muted ml-2">{active.val}%</span>
            {active.desc && (
              <p className="text-[10px] text-fin-text-muted mt-0.5">{active.desc}</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
