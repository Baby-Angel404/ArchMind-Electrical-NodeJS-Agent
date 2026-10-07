'use client';

import React from 'react';
import { Activity, Wifi, WifiOff, Cpu } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  deviceCount: number;
}

export function Header({ wsConnected, deviceCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ArchMind
            <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800 font-mono">
              v1.0.0
            </span>
          </h1>
          <p className="text-xs text-gray-400">Cyber-Physical Electrical & IoT Architecture Agent</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-gray-300 bg-background/50 px-3 py-1.5 rounded-full border border-border">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Nodes: <strong className="text-white">{deviceCount}</strong></span>
        </div>

        <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border border-border">
          {wsConnected ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Live Telemetry Stream</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 font-medium">Reconnecting Stream...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
