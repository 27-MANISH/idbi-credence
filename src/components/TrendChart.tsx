'use client';

import React from 'react';

interface TrendPoint {
  label: string; // e.g. "Jan", "Feb"
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  showDots?: boolean;
  showArea?: boolean;
}

export default function TrendChart({
  data,
  height = 80,
  strokeColor = '#01696f',
  fillColor = 'rgba(1,105,111,0.10)',
  showDots = true,
  showArea = true,
}: TrendChartProps) {
  if (!data || data.length < 2) return null;

  const width = 300;
  const paddingX = 12;
  const paddingY = 10;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) =>
    paddingX + (i * (width - paddingX * 2)) / (data.length - 1);

  const toY = (v: number) =>
    paddingY + (1 - (v - min) / range) * (height - paddingY * 2);

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

  // Build smooth path using cardinal cubic spline
  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
      const cp1y = pts[i].y;
      const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
      const cp2y = pts[i + 1].y;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1].x},${pts[i + 1].y}`;
    }
    return d;
  };

  const linePath = buildPath(points);

  // Area path closes at bottom
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path d={areaPath} fill="url(#trendGrad)" />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots &&
        points.map((pt, i) => (
          <circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="white"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={`lbl-${i}`}
          x={toX(i)}
          y={height}
          textAnchor="middle"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          fill="rgba(121,120,118,0.7)"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}
