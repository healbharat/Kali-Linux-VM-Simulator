import React, { useState } from 'react';
import { simulateSocialScan } from '../services/geminiService';

const PLATFORMS = {
  'X-Twitter': 'x',
  'InstaGram': 'instagram',
  'FaceBook': 'facebook',
};

const SocialToolkit: React.FC = () => {
  const [target, setTarget] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['x']);
  const [log, setLog] = useState<string[]>(['[INFO] System ready. Awaiting target...']);
  const [isScanning, setIsScanning] = useState(false);

  const handlePlatformChange = (platformKey: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformKey)
        ? prev.filter(p => p !== platformKey)
        : [...prev, platformKey]
    );
  };

  const handleScan = async () => {
    if (!target.trim() || selectedPlatforms.length === 0) {
      setLog(['[ERROR] Target username and at least one platform are required.']);
      return;
    }
    setIsScanning(true);
    setLog([`[INFO] Initializing scan for target: '${target}'...`]);
    const result = await simulateSocialScan(target, selectedPlatforms);
    setLog(result.split('\n'));
    setIsScanning(false);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-accent)] p-4 space-y-4 font-mono text-sm">
      <h2 className="text-lg text-center border-b pb-2" style={{ borderColor: 'var(--color-accent-dark)' }}>
        S.E.T. - Social Engineering Toolkit
      </h2>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col md:flex-row gap-4 p-2 border bg-black/30" style={{ borderColor: 'var(--color-accent-dark)' }}>
        <div className="flex-grow">
          <label htmlFor="target-input" className="block mb-1 text-[var(--color-text-primary)]">Target Username:</label>
          <input
            id="target-input"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., john_doe"
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ borderColor: 'var(--color-accent-dark)' }}
            disabled={isScanning}
          />
        </div>
        <div className="flex-shrink-0">
          <label className="block mb-1 text-[var(--color-text-primary)]">Platforms:</label>
          <div className="flex gap-4 items-center h-full">
            {Object.entries(PLATFORMS).map(([name, key]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(key)}
                  onChange={() => handlePlatformChange(key)}
                  disabled={isScanning}
                  className="appearance-none h-4 w-4 border bg-gray-900 checked:bg-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-accent)' }}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full md:w-auto h-10 px-6 bg-[var(--color-accent-dark)] hover:bg-[var(--color-accent-hover)] text-white border disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors self-end"
          style={{ borderColor: 'var(--color-accent)' }}
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {/* --- LOG OUTPUT --- */}
      <div className="flex-grow bg-black/50 p-2 border border-[var(--color-accent-dark)] overflow-y-auto h-64">
        <div className="whitespace-pre-wrap">
          {log.map((line, index) => (
            <div key={index}>
              <span className="text-gray-500 mr-2">{String(index + 1).padStart(2, '0')}</span>
              <span
                 className={
                    line.startsWith('[ERROR]') ? 'text-[var(--color-accent-danger)]' :
                    line.startsWith('[WARN]') ? 'text-yellow-400' :
                    'text-[var(--color-accent)]'
                 }
              >
                  {line}
              </span>
            </div>
          ))}
          {isScanning && (
            <div>
                 <span className="text-gray-500 mr-2">{String(log.length + 1).padStart(2, '0')}</span>
                 <span className="ml-2 h-4 w-2 bg-[var(--color-accent)] animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialToolkit;