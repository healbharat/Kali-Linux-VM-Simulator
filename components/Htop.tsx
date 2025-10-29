
import React, { useState, useEffect } from 'react';

type Process = {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
};

const initialProcesses: Omit<Process, 'cpu' | 'mem' | 'time'>[] = [
  { pid: 1, user: 'root', command: '/sbin/init splash' },
  { pid: 2, user: 'root', command: '[kthreadd]' },
  { pid: 10, user: 'root', command: '[kworker/0:0-events]' },
  { pid: 123, user: 'root', command: '/usr/lib/systemd/systemd-journald' },
  { pid: 234, user: 'root', command: '/usr/sbin/sshd -D' },
  { pid: 345, user: 'kali', command: '/usr/bin/gnome-shell' },
  { pid: 456, user: 'kali', command: '/usr/bin/python3 /usr/bin/terminator' },
  { pid: 567, user: 'root', command: 'bash' },
  { pid: 678, user: 'kali', command: 'firefox' },
  { pid: 789, user: 'root', command: '/usr/bin/htop' },
];

const generateProcesses = (): Process[] => {
  return initialProcesses.map(p => {
    const timeMinutes = Math.floor(Math.random() * 20);
    const timeSeconds = Math.floor(Math.random() * 60);
    return {
        ...p,
        cpu: parseFloat((Math.random() * (p.command.includes('firefox') || p.command.includes('gnome') ? 15 : 2)).toFixed(1)),
        mem: parseFloat((Math.random() * 5 + (p.command.includes('firefox') ? 10 : 0.5)).toFixed(1)),
        time: `${String(timeMinutes).padStart(2, '0')}:${String(timeSeconds).padStart(2, '0')}`,
    }
  }).sort((a,b) => b.cpu - a.cpu);
};

const Htop: React.FC = () => {
    const [processes, setProcesses] = useState<Process[]>(generateProcesses);

    useEffect(() => {
        const interval = setInterval(() => {
            setProcesses(generateProcesses());
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-black text-white font-mono text-xs p-1">
            <div className="flex-shrink-0 whitespace-pre">
                {'PID   USER      CPU%  MEM%  TIME+      COMMAND'}
            </div>
            <div className="flex-grow overflow-y-auto whitespace-pre">
                {processes.map(p => (
                    <div key={p.pid} className="flex">
                        <span className="w-6 text-right text-gray-400">{p.pid}</span>
                        <span className="w-10 text-left pl-2 text-cyan-400">{p.user}</span>
                        <span className="w-8 text-right pr-1">{p.cpu.toFixed(1)}</span>
                        <span className="w-8 text-right pr-1">{p.mem.toFixed(1)}</span>
                        <span className="w-11 text-right text-gray-400">{p.time}</span>
                        <span className="pl-3">{p.command}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Htop;