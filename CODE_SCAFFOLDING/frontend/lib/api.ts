import { DeviceInfo, TelemetryData, AgentAnalysis } from '../types/telemetry';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchDevices(): Promise<DeviceInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/api/devices`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch devices');
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return [];
  }
}

export async function fetchTelemetry(deviceId: string): Promise<TelemetryData[]> {
  try {
    const res = await fetch(`${API_BASE}/api/telemetry/${deviceId}?limit=30`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return [];
  }
}

export async function triggerAgentAnalysis(task: string, context: any): Promise<AgentAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/api/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context }),
    });
    if (!res.ok) throw new Error('Failed to perform agent analysis');
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}
