import React, { useState, useEffect, useRef } from 'react';
import { simulateBitcoinMinerLog } from '../services/geminiService';
import LineChart from './LineChart';

const MAX_HISTORY_POINTS = 30;

const BitcoinMiner: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [log, setLog] = useState<string[]>(['[INFO] Miner idle. Press "Start Mining" to begin.']);
  const [hashrate, setHashrate] = useState(0);
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);
  const [acceptedShares, setAcceptedShares] = useState(0);
  const [gpuTemp, setGpuTemp] = useState(45);
  const [btcBalance, setBtcBalance] = useState(0.00000000);
  const intervalRef = useRef<number | null>(null);

  const startMining = async () => {
    setIsMining(true);
    setLog(['[INFO] Initializing miner...']);
    const initialLog = await simulateBitcoinMinerLog();
    setLog(initialLog.split('\n'));
    setAcceptedShares(0);
    setHashrateHistory([]);
    
    intervalRef.current = window.setInterval(() => {
        const newHashrate = parseFloat((95.5 + Math.random() * 5).toFixed(2));
        setHashrate(newHashrate);
        setHashrateHistory(prev => [...prev.slice(-MAX_HISTORY_POINTS + 1), newHashrate]);

        setGpuTemp(parseFloat((72 + Math.random() * 4).toFixed(1)));
        
        if (Math.random() > 0.7) {
            setAcceptedShares(prev => prev + 1);
            setLog(prev => [...prev, `[INFO] Share accepted! (${prev.filter(l => l.includes("Share accepted")).length + 1})`]);
            setBtcBalance(prev => prev + 0.00000157);
        }
    }, 2000);
  };

  const stopMining = () => {
    setIsMining(false);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    setHashrate(0);
    setHashrateHistory(prev => [...prev.slice(-MAX_HISTORY_POINTS + 1), 0]);
    setGpuTemp(45);
    setLog(prev => [...prev, '[INFO] Mining process stopped by user.']);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 space-y-4 font-mono text-sm">
      <h2 className="text-lg text-center text-yellow-500 border-b border-yellow-700 pb-2">
        Bitcoin Mining Simulator
      </h2>

      {/* --- SCREEN & CONTROLS --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow h-24 md:h-auto">
             <LineChart data={hashrateHistory} color="rgb(234 179 8)" />
        </div>
        <div className="flex-shrink-0 flex md:flex-col items-center justify-center space-x-2 md:space-x-0 md:space-y-2">
            <button
              onClick={startMining}
              disabled={isMining}
              className="w-32 h-10 px-4 bg-green-700 hover:bg-green-600 text-white border border-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Start Mining
            </button>
             <button
              onClick={stopMining}
              disabled={!isMining}
              className="w-32 h-10 px-4 bg-red-700 hover:bg-red-600 text-white border border-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Stop Mining
            </button>
        </div>
      </div>
      
       {/* --- STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center p-2 border bg-black/30 border-yellow-700">
        <div>
            <div className="text-xs text-yellow-400">HASHRATE</div>
            <div className="text-xl font-bold">{hashrate} <span className="text-sm">MH/s</span></div>
        </div>
        <div>
            <div className="text-xs text-yellow-400">ACCEPTED</div>
            <div className="text-xl font-bold">{acceptedShares}</div>
        </div>
        <div>
            <div className="text-xs text-yellow-400">GPU TEMP</div>
            <div className="text-xl font-bold">{gpuTemp}°C</div>
        </div>
        <div>
            <div className="text-xs text-yellow-400">BALANCE</div>
            <div className="text-xl font-bold">{btcBalance.toFixed(8)}</div>
        </div>
      </div>

      {/* --- LOG OUTPUT --- */}
      <div className="flex-grow bg-black/50 p-2 border border-yellow-700 overflow-y-auto h-48">
        <div className="whitespace-pre-wrap">
          {log.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2 select-none w-8 text-right">{index + 1}</span>
              <span className={`flex-1 ${line.startsWith('[INFO] Share accepted') ? 'text-green-400 font-bold' : 'text-[var(--color-text-secondary)]'}`}>
                  {line}
              </span>
            </div>
          ))}
          {isMining && hashrate === 0 && (
             <div className="flex">
                 <span className="text-gray-500 mr-2 select-none w-8 text-right">{log.length + 1}</span>
                 <span className="ml-2 h-4 w-2 bg-yellow-500 animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BitcoinMiner;