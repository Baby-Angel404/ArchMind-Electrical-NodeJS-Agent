'use client';

import React from 'react';
import { TelemetryData } from '../types/telemetry';

interface TelemetryChartProps {
  data: TelemetryData[];
  title: string;
  dataKey: keyof TelemetryData;
  unit: string;
  strokeColor?: string;
}

export function TelemetryChart({
  data,
  title,
  dataKey,
  unit,
  strokeColor = '#3B82F6',
}: TelemetryChartProps) {
  const points = data
    .map((d) => Number(d[dataKey]))
    .filter((v) => !isNaN(v));

  const min = points.length > 0 ? Math.min(...points) : 0;
  const max = points.length > 0 ? Math.max(...points) : 100;
  const range = max - min === 0 ? 1 : max - min;

  const width = 500;
  const height = 140;
  const padding = 15;

  const svgPoints = points
    .map((val, idx) => {
      const x = padding + (idx / Math.max(points.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  const latestVal = points.length > 0 ? points[points.length - 1] : 0;

  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</span>
        <span className="text-sm font-bold font-mono text-white">
          {latestVal.toFixed(2)} {unit}
        </span>
      </div>

      <div className="h-32 w-full flex items-center justify-center relative overflow-hidden bg-background/40 rounded-lg border border-border/50">
        {points.length >= 2 ? (
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={svgPoints}
            />
          </svg>
        ) : (
          <span className="text-xs text-gray-500 font-mono">Accumulating telemetry stream...</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
        <span>Min: {min.toFixed(1)} {unit}</span>
        <span>Samples: {points.length}</span>
        <span>Max: {max.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
}
