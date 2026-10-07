import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'alert';
}

export function MetricCard({ label, value, unit, icon, status = 'normal' }: MetricCardProps) {
  const statusStyles = {
    normal: 'border-border text-blue-400 bg-card',
    warning: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    alert: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${statusStyles[status]} shadow-sm`}>
      <div className="flex items-center justify-between text-gray-400 mb-2">
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        <div className="p-1.5 rounded-lg bg-background/60">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        <span className="text-xs font-medium text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
