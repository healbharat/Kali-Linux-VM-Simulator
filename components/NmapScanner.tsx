import React, { useState } from 'react';
import { simulateNmapScan } from '../services/geminiService';

const NmapScanner: React.FC = () => {
  const [target, setTarget] = useState('scanme.nmap.org');
  const [log, setLog] = useState<string[]>(['[INFO] Nmap ready. Enter a target and start the scan.']);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!target.trim()) {
      setLog(['[ERROR] Target IP or hostname is required.']);
      return;
    }
    setIsScanning(true);
    setLog([`[INFO] Initiating Nmap scan on ${target}...`]);
    const result = await simulateNmapScan(target);
    setLog(result.split('\n'));
    setIsScanning(false);
  };
  
  const getPortLineColor = (line: string) => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes(' open ')) return 'text-green-400';
    if (lowerLine.includes(' filtered ')) return 'text-yellow-400';
    if (lowerLine.includes(' closed ')) return 'text-gray-500';
    return 'text-[var(--color-text-secondary)]';
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 space-y-4 font-mono text-sm">
      <h2 className="text-lg text-center text-cyan-400 border-b border-cyan-700 pb-2">
        Nmap Port Scanner
      </h2>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col md:flex-row gap-4 p-2 border bg-black/30 border-cyan-700">
        <div className="flex-grow">
          <label htmlFor="target-input" className="block mb-1 text-cyan-300">Target IP / Hostname:</label>
          <input
            id="target-input"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., 192.168.1.1 or example.com"
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            style={{ borderColor: 'var(--color-border)' }}
            disabled={isScanning}
          />
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full md:w-auto h-10 px-6 bg-cyan-700 hover:bg-cyan-600 text-white border border-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors self-end"
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {/* --- LOG OUTPUT --- */}
      <div className="flex-grow bg-black/50 p-2 border border-cyan-700 overflow-y-auto h-64">
        <div className="whitespace-pre-wrap">
          {log.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-gray-600 mr-2 select-none w-8 text-right">{index + 1}</span>
              <span className={`flex-1 ${getPortLineColor(line)}`}>
                  {line}
              </span>
            </div>
          ))}
          {isScanning && (
            <div className="flex">
                 <span className="text-gray-600 mr-2 select-none w-8 text-right">{log.length + 1}</span>
                 <span className="ml-2 h-4 w-2 bg-cyan-500 animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NmapScanner;
