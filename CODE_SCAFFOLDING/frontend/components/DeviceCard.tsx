import React from 'react';
import { DeviceInfo } from '../types/telemetry';
import { Server, CheckCircle2, XCircle, MapPin } from 'lucide-react';

interface DeviceCardProps {
  device: DeviceInfo;
  isSelected: boolean;
  onSelect: (deviceId: string) => void;
}

export function DeviceCard({ device, isSelected, onSelect }: DeviceCardProps) {
  const isOnline = device.status === 'online';

  return (
    <div
      onClick={() => onSelect(device.deviceId)}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-950/20 shadow-md ring-1 ring-blue-500/50'
          : 'border-border bg-card hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{device.name}</h3>
            <span className="text-xs font-mono text-gray-400">{device.deviceId}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          {isOnline ? (
            <span className="flex items-center text-emerald-400 font-medium gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          ) : (
            <span className="flex items-center text-gray-500 font-medium gap-1">
              <XCircle className="w-3.5 h-3.5" /> Offline
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span>{device.location || 'Default Room'}</span>
        </div>
        <span className="font-mono bg-gray-800/50 px-2 py-0.5 rounded text-gray-300">
          FW: {device.firmwareVersion}
        </span>
      </div>
    </div>
  );
}
