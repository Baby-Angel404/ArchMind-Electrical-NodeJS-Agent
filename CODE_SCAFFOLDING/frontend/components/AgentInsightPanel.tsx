'use client';

import React, { useState } from 'react';
import { AgentAnalysis } from '../types/telemetry';
import { triggerAgentAnalysis } from '../lib/api';
import { BrainCircuit, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export function AgentInsightPanel() {
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunAnalysis = async () => {
    setLoading(true);
    const result = await triggerAgentAnalysis('Electrical Bus & Transducer Safety Assessment', {
      hardware: [{ component: 'LDO Linear Regulator', vin: 12.0, vout: 3.3, current: 0.45 }],
      firmware: [{ mcu: 'ESP32', rtos: 'FreeRTOS' }],
      requirements: [{ lineVoltage: 230, standard: 'IEC 61010-1' }],
    });
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="p-5 rounded-xl border border-blue-900/40 bg-blue-950/10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            ArchMind AI Engineering Reasoning
          </h2>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Architecture...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Architectural FMEA</span>
            </>
          )}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-card/80 border border-border">
            <p className="text-gray-200 font-medium leading-relaxed">{analysis.summary}</p>
            <div className="mt-2 flex items-center gap-2 text-blue-400 font-mono">
              <span>Confidence Score:</span>
              <span className="font-bold">{(analysis.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
              <h4 className="text-rose-400 font-semibold flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" /> Identified Physical & Protocol Risks
              </h4>
              <ul className="space-y-1.5 text-gray-300">
                {analysis.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <h4 className="text-emerald-400 font-semibold flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4" /> Recommended Countermeasures
              </h4>
              <ul className="space-y-1.5 text-gray-300">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">
          Click &quot;Run Architectural FMEA&quot; to trigger AI-assisted reasoning over power dissipation, galvanic isolation, and watchdog parameters.
        </p>
      )}
    </div>
  );
}
