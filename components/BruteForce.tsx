import React, { useState } from 'react';
import { simulateBruteForceAttack } from '../services/geminiService';

const SERVICES = ['SSH', 'FTP', 'Web Login', 'Telnet', 'RDP', 'SMB'];

const BruteForce: React.FC = () => {
  const [target, setTarget] = useState('192.168.1.101');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('admin');
  const [service, setService] = useState(SERVICES[0]);
  const [log, setLog] = useState<string[]>(['[INFO] Brute force module initialized. Ready for attack configuration.']);
  const [isAttacking, setIsAttacking] = useState(false);

  const handleAttack = async () => {
    if (!target.trim() || !port.trim() || !username.trim()) {
      setLog(['[ERROR] Target, Port, and Username are required fields.']);
      return;
    }
    setIsAttacking(true);
    setLog([`[INFO] Starting brute force attack on ${service} at ${target}:${port} for user '${username}'...`]);
    const result = await simulateBruteForceAttack(target, port, username, service);
    setLog(result.split('\n'));
    setIsAttacking(false);
  };

  const handleServiceChange = (selectedService: string) => {
    setService(selectedService);
    switch (selectedService) {
        case 'SSH':
            setPort('22');
            break;
        case 'FTP':
            setPort('21');
            break;
        case 'Web Login':
            setPort('80');
            break;
        case 'Telnet':
            setPort('23');
            break;
        case 'RDP':
            setPort('3389');
            break;
        case 'SMB':
            setPort('445');
            break;
        default:
            setPort('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-accent-danger)] p-4 space-y-4 font-mono text-sm">
      <h2 className="text-lg text-center border-b pb-2" style={{ borderColor: 'var(--color-accent-danger)' }}>
        Brute Force Attack Simulator
      </h2>

      {/* --- CONTROLS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 border bg-black/30" style={{ borderColor: 'var(--color-accent-danger)' }}>
        <div className="md:col-span-2">
          <label htmlFor="target-input" className="block mb-1 text-[var(--color-text-primary)]">Target IP / URL:</label>
          <input
            id="target-input"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-danger)]"
            style={{ borderColor: 'var(--color-accent-danger)' }}
            disabled={isAttacking}
          />
        </div>
        <div>
          <label htmlFor="port-input" className="block mb-1 text-[var(--color-text-primary)]">Port:</label>
          <input
            id="port-input"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-danger)]"
            style={{ borderColor: 'var(--color-accent-danger)' }}
            disabled={isAttacking}
          />
        </div>
        <div>
           <label htmlFor="service-select" className="block mb-1 text-[var(--color-text-primary)]">Service:</label>
           <select 
             id="service-select"
             value={service}
             onChange={(e) => handleServiceChange(e.target.value)}
             className="w-full h-10 bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-danger)]"
             style={{ borderColor: 'var(--color-accent-danger)' }}
             disabled={isAttacking}
            >
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="user-input" className="block mb-1 text-[var(--color-text-primary)]">Username:</label>
          <input
            id="user-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-danger)]"
            style={{ borderColor: 'var(--color-accent-danger)' }}
            disabled={isAttacking}
          />
        </div>
        <div className="md:col-span-2 flex items-end">
            <button
            onClick={handleAttack}
            disabled={isAttacking}
            className="w-full h-10 px-6 bg-red-800 hover:bg-red-700 text-white border border-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            style={{ 
                backgroundColor: isAttacking ? '' : 'var(--color-accent-danger)',
                borderColor: 'var(--color-accent-danger)'
            }}
            >
            {isAttacking ? 'Attacking...' : 'Start Attack'}
            </button>
        </div>
      </div>

      {/* --- LOG OUTPUT --- */}
      <div className="flex-grow bg-black/50 p-2 border overflow-y-auto h-64" style={{ borderColor: 'var(--color-accent-danger)' }}>
        <div className="whitespace-pre-wrap">
          {log.map((line, index) => (
            <div key={index}>
              <span className="text-gray-500 mr-2">{String(index + 1).padStart(3, '0')}</span>
              <span
                 className={
                    line.startsWith('[SUCCESS]') ? 'text-[var(--color-accent)] font-bold' :
                    line.startsWith('[FAILURE]') ? 'text-[var(--color-text-secondary)]' :
                    line.startsWith('[ERROR]') ? 'text-yellow-400' :
                    'text-[var(--color-accent-danger)]'
                 }
              >
                  {line}
              </span>
            </div>
          ))}
          {isAttacking && (
            <div>
                 <span className="text-gray-500 mr-2">{String(log.length + 1).padStart(3, '0')}</span>
                 <span className="ml-2 h-4 w-2 bg-[var(--color-accent-danger)] animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BruteForce;