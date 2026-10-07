'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { DeviceCard } from '../components/DeviceCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { AgentInsightPanel } from '../components/AgentInsightPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchDevices, fetchTelemetry } from '../lib/api';
import { DeviceInfo, TelemetryData } from '../types/telemetry';
import { Zap, Gauge, Thermometer, Waves } from 'lucide-react';

export default function DashboardPage() {
  const [devices, setDevices] = useState<DeviceInfo[]>([
    {
      deviceId: 'esp32-node-001',
      name: 'Main Distribution Feeder 1',
      hardwareModel: 'ESP32-WROOM-32E',
      firmwareVersion: '1.0.0',
      location: 'Substation Electrical Room A',
      status: 'online',
      registeredAt: new Date().toISOString(),
    },
  ]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('esp32-node-001');
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryData | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      const devList = await fetchDevices();
      if (devList && devList.length > 0) {
        setDevices(devList);
        setSelectedDeviceId(devList[0].deviceId);
      }
      const initialHistory = await fetchTelemetry(selectedDeviceId);
      if (initialHistory && initialHistory.length > 0) {
        setTelemetryHistory(initialHistory);
        setLatestTelemetry(initialHistory[initialHistory.length - 1]);
      }
    }
    init();
  }, [selectedDeviceId]);

  // Handle incoming live telemetry message from WebSocket
  const handleLiveTelemetry = useCallback((incoming: TelemetryData) => {
    if (incoming.deviceId === selectedDeviceId) {
      setLatestTelemetry(incoming);
      setTelemetryHistory((prev) => {
        const updated = [...prev, incoming];
        return updated.slice(-30); // Keep last 30 samples for sparkline chart
      });
    }
  }, [selectedDeviceId]);

  const { isConnected } = useWebSocket(handleLiveTelemetry);

  const voltage = latestTelemetry?.voltage ?? 230.2;
  const current = latestTelemetry?.current ?? 4.82;
  const power = latestTelemetry?.power ?? 1109.56;
  const temperature = latestTelemetry?.temperature ?? 36.4;

  const voltageStatus = voltage > 250 || voltage < 207 ? 'alert' : 'normal';
  const tempStatus = temperature > 65 ? 'alert' : temperature > 50 ? 'warning' : 'normal';

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-100">
      <Header wsConnected={isConnected} deviceCount={devices.length} />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Mains Voltage"
            value={voltage.toFixed(1)}
            unit="V RMS"
            icon={<Zap className="w-4 h-4" />}
            status={voltageStatus}
          />
          <MetricCard
            label="Load Current"
            value={current.toFixed(2)}
            unit="A RMS"
            icon={<Gauge className="w-4 h-4" />}
          />
          <MetricCard
            label="Active Power"
            value={power.toFixed(1)}
            unit="Watts"
            icon={<Waves className="w-4 h-4" />}
          />
          <MetricCard
            label="Transducer Temp"
            value={temperature.toFixed(1)}
            unit="°C"
            icon={<Thermometer className="w-4 h-4" />}
            status={tempStatus}
          />
        </div>

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TelemetryChart
            data={telemetryHistory}
            title="Voltage Transient Profile"
            dataKey="voltage"
            unit="V"
            strokeColor="#3B82F6"
          />
          <TelemetryChart
            data={telemetryHistory}
            title="Current Demand Profile"
            dataKey="current"
            unit="A"
            strokeColor="#10B981"
          />
          <TelemetryChart
            data={telemetryHistory}
            title="Active Power Trend"
            dataKey="power"
            unit="W"
            strokeColor="#F59E0B"
          />
        </div>

        {/* AI Engineering Agent Panel */}
        <AgentInsightPanel />

        {/* Device Management Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Monitored Electrical Nodes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((dev) => (
              <DeviceCard
                key={dev.deviceId}
                device={dev}
                isSelected={dev.deviceId === selectedDeviceId}
                onSelect={(id) => setSelectedDeviceId(id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
