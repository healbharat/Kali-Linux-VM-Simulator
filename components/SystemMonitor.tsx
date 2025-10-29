import React, { useState, useEffect } from 'react';

const TOTAL_RAM_MB = 8192; // 8GB

interface SystemUsage {
  cpu: number;
  ram: {
    used: number;
    total: number;
  };
  network: {
    down: number;
    up: number;
  };
}

const generateUsage = (): SystemUsage => {
  // Simulate baseline CPU usage with spikes
  const baseCpu = 15;
  const cpuSpike = Math.random() > 0.9 ? Math.random() * 50 : 0;
  const cpu = Math.min(baseCpu + Math.random() * 10 + cpuSpike, 100);

  // Simulate baseline RAM usage with some fluctuation
  const baseRam = TOTAL_RAM_MB * 0.25;
  const ram = Math.min(baseRam + Math.random() * (TOTAL_RAM_MB * 0.1), TOTAL_RAM_MB);
  
  // Simulate network usage in KB/s
  const down = Math.random() * 500 + (Math.random() > 0.8 ? Math.random() * 2000 : 0);
  const up = Math.random() * 100 + (Math.random() > 0.95 ? Math.random() * 500 : 0);

  return {
    cpu: parseFloat(cpu.toFixed(1)),
    ram: { used: Math.floor(ram), total: TOTAL_RAM_MB },
    network: { down: parseFloat(down.toFixed(2)), up: parseFloat(up.toFixed(2)) },
  };
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const colorClass = value > 85 ? 'bg-[var(--color-accent-danger)]' : value > 60 ? 'bg-yellow-500' : 'bg-[var(--color-accent)]';
  return (
    <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-4 overflow-hidden border border-[var(--color-border)]">
      <div
        className={`h-4 rounded-full transition-all duration-500 ease-in-out ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const SystemMonitor: React.FC = () => {
  const [usage, setUsage] = useState<SystemUsage>(generateUsage);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(generateUsage());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 space-y-6 font-mono text-sm">
      <h2 className="text-lg text-center text-[var(--color-accent)] border-b pb-2" style={{ borderColor: 'var(--color-accent-dark)' }}>
        System Resource Monitor
      </h2>
      
      {/* CPU Usage */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <h3 className="font-bold text-[var(--color-accent)]">CPU Usage</h3>
          <span className="text-lg font-bold text-white">{usage.cpu}%</span>
        </div>
        <ProgressBar value={usage.cpu} />
      </div>

      {/* RAM Usage */}
      <div className="space-y-2">
         <div className="flex justify-between items-baseline">
          <h3 className="font-bold text-[var(--color-accent)]">RAM Usage</h3>
          <span className="text-sm font-bold text-white">
            {usage.ram.used} MB / {usage.ram.total} MB
          </span>
        </div>
        <ProgressBar value={(usage.ram.used / usage.ram.total) * 100} />
      </div>

       {/* Network Usage */}
      <div className="space-y-3">
        <h3 className="font-bold text-[var(--color-accent)] border-b pb-1" style={{ borderColor: 'var(--color-accent-dark)' }}>Network Activity</h3>
        <div className="flex justify-around text-center">
            <div>
                <div className="text-[var(--color-text-secondary)] text-xs">Download</div>
                <div className="text-white font-bold text-lg">{usage.network.down} <span className="text-xs">KB/s</span></div>
            </div>
            <div>
                <div className="text-[var(--color-text-secondary)] text-xs">Upload</div>
                <div className="text-white font-bold text-lg">{usage.network.up} <span className="text-xs">KB/s</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;