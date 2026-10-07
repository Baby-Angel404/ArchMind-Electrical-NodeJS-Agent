'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { TelemetryData } from '../types/telemetry';

export function useWebSocket(onTelemetryReceived?: (data: TelemetryData) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    if (onTelemetryReceived) {
      socket.on('telemetry:update', (data: TelemetryData) => {
        onTelemetryReceived(data);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [onTelemetryReceived]);

  return { isConnected };
}
