import React, { useState } from 'react';
import { simulateBurpSuiteScan } from '../services/geminiService';

const BurpSuite: React.FC = () => {
  const [target, setTarget] = useState('http://example-vuln-app.com');
  const [log, setLog] = useState<string[]>(['[INFO] Burp Suite Professional ready. Enter a target URL to begin scanning.']);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!target.trim()) {
      setLog(['[ERROR] Target URL is required.']);
      return;
    }
    setIsScanning(true);
    setLog([`[INFO] Starting active security scan on target: '${target}'...`]);
    const result = await simulateBurpSuiteScan(target);
    setLog(result.split('\n'));
    setIsScanning(false);
  };

  const getSeverityColor = (line: string) => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('[high]') || lowerLine.includes('[critical]')) return 'text-red-500';
    if (lowerLine.includes('[medium]')) return 'text-orange-400';
    if (lowerLine.includes('[low]')) return 'text-yellow-400';
    if (lowerLine.includes('[info')) return 'text-blue-400';
    return 'text-[var(--color-text-secondary)]';
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 space-y-4 font-mono text-sm">
      <h2 className="text-lg text-center text-orange-500 border-b border-orange-700 pb-2">
        Burp Suite Professional
      </h2>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col md:flex-row gap-4 p-2 border bg-black/30 border-orange-700">
        <div className="flex-grow">
          <label htmlFor="target-input" className="block mb-1 text-orange-400">Target URL:</label>
          <input
            id="target-input"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="http://example.com"
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            style={{ borderColor: 'var(--color-border)' }}
            disabled={isScanning}
          />
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full md:w-auto h-10 px-6 bg-orange-700 hover:bg-orange-600 text-white border border-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors self-end"
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {/* --- LOG OUTPUT --- */}
      <div className="flex-grow bg-black/50 p-2 border border-orange-700 overflow-y-auto h-64">
        <div className="whitespace-pre-wrap">
          {log.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2 select-none w-8 text-right">{index + 1}</span>
              <span className={`flex-1 ${getSeverityColor(line)}`}>
                  {line}
              </span>
            </div>
          ))}
          {isScanning && (
            <div className="flex">
                 <span className="text-gray-500 mr-2 select-none w-8 text-right">{log.length + 1}</span>
                 <span className="ml-2 h-4 w-2 bg-orange-500 animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BurpSuite;
