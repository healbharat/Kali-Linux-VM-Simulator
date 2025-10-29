import React, { useState, useEffect } from 'react';

interface TopBarProps {
  activeWindowTitle: string;
}

const AppleIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-text-primary)]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.838,3.315c-1.144,0-2.23,0.534-2.904,1.339c-0.748,0.885-1.314,2.233-1.07,3.548c0.74,0.114,1.494-0.223,2.1-0.223c1.087,0,2.14,0.505,2.814,1.257c0.617,0.692,1.018,1.636,0.962,2.628c-0.518,0.837-1.48,1.392-2.5,1.392c-0.83,0-1.6-0.386-2.227-1.033c-1.394-1.458-2.227-3.76-1.636-5.943C7.042,4.39,8.813,3.315,10.838,3.315z M10.01,0C7.978,0,5.918,1.15,4.693,3.223C2.356,7.182,3.317,12.636,5.81,15.82C6.98,17.29,8.449,18,10.01,18c0.11,0,0.22,0,0.33-0.012c1.72-0.18,3.28-1.25,4.11-2.73c0.5-0.89,0.68-1.92,0.56-2.94c-0.04-0.34-0.08-0.67-0.14-1c-0.45-2.5-2.68-4.33-5.22-4.33c-0.67,0-1.3,0.13-1.89,0.36c-0.23,0.09-0.46,0.18-0.69,0.29c-0.95,0.44-1.99,0.92-2.78,0.44c-0.52-0.32-0.46-1.12,0.12-1.89c0.8-1.06,2.05-1.74,3.38-1.74c0.4,0,0.8,0.06,1.17,0.18c-0.21-1.55,0.35-3.2,1.3-4.34C13.06,1.18,14.04,0.46,15.1,0.46c0.1,0,0.2,0,0.3,0.02c-0.82-0.29-1.7-0.48-2.62-0.48C11.5,0,10.74,0,10.01,0z"></path>
  </svg>
);

const WifiIcon = () => (
    <svg className="w-4 h-4 text-[var(--color-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.556A5.5 5.5 0 0112 15c1.472 0 2.842.55 3.889 1.556M4.5 13.5c3.037-3.037 7.963-3.037 11 0" />
    </svg>
);

const BatteryIcon: React.FC<{ level: number, isCharging: boolean }> = ({ level, isCharging }) => {
    const width = Math.max(0, (level / 100) * 18); // 18 is the inner width of the battery
    const color = level < 20 ? '#ef4444' : '#e5e7eb';
  
    return (
      <div className="relative w-6 h-4">
        <svg className="w-6 h-4" fill="none" stroke={color} viewBox="0 0 24 12">
          <rect x="1" y="1" width="20" height="10" rx="2" strokeWidth="1.5" />
          <line x1="22" y1="4" x2="22" y2="8" strokeWidth="2" />
          <rect x="2" y="2" width={width} height="8" rx="1" fill={color} />
        </svg>
        {isCharging && (
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.918 2.875L6.082 10.375H10V17.125L13.918 9.625H10V2.875Z" />
            </svg>
        )}
      </div>
    );
};

const TopBar: React.FC<TopBarProps> = ({ activeWindowTitle }) => {
    const [time, setTime] = useState(new Date());
    const [battery, setBattery] = useState({ level: 95, isCharging: false });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const batteryManager = setInterval(() => {
            setBattery(prev => {
                let newLevel = prev.level;
                let newIsCharging = prev.isCharging;

                if (newIsCharging) {
                    newLevel += 2;
                    if (newLevel >= 100) {
                        newLevel = 100;
                        newIsCharging = false;
                    }
                } else {
                    newLevel -= 1;
                    if (newLevel <= 20) {
                       if(Math.random() > 0.8) { // Randomly start charging
                           newIsCharging = true;
                       }
                    }
                    if(newLevel < 0) newLevel = 0;
                }
                return { level: newLevel, isCharging: newIsCharging };
            });
        }, 10000); // Update battery every 10 seconds
        return () => clearInterval(batteryManager);
    }, []);

    return (
        <header className="h-7 w-full bg-[var(--color-bg-secondary)] backdrop-blur-md flex-shrink-0 flex items-center justify-between px-4 text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] select-none">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <AppleIcon />
                <span className="font-bold">{activeWindowTitle}</span>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-3">
                <WifiIcon />
                <div className="flex items-center gap-1">
                    <BatteryIcon level={battery.level} isCharging={battery.isCharging} />
                    <span>{battery.level}%</span>
                </div>
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </header>
    );
};

export default TopBar;
