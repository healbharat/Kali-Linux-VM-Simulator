import React, { useState, useEffect, useRef } from 'react';
import { simulateMetasploit } from '../services/geminiService';

const Metasploit: React.FC = () => {
    const [log, setLog] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [prompt, setPrompt] = useState('msf6 > ');
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const result = await simulateMetasploit('startup');
            setLog(result);
            setIsLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [log, isLoading]);

    const handleCommand = async () => {
        if (!inputValue.trim()) return;
        const command = inputValue.trim();
        const newLog = `${log}\n${prompt}${command}`;
        setLog(newLog);
        setInputValue('');
        setIsLoading(true);

        const result = await simulateMetasploit(command);
        setLog(`${newLog}\n${result}`);
        
        // Super simplified prompt update
        if (command.startsWith('use exploit')) {
            const exploitName = command.split(' ')[1] || '';
            setPrompt(`msf6 exploit(${exploitName.replace('exploit/', '')}) > `);
        } else if (command === 'exit' || command === 'back') {
            setPrompt('msf6 > ');
        }
        setIsLoading(false);
    };

    return (
        <div 
            className="h-full flex flex-col bg-black text-white p-2 font-mono text-sm"
            onClick={() => document.getElementById('metasploit-input')?.focus()}
        >
            <div ref={scrollRef} className="flex-grow overflow-y-auto whitespace-pre-wrap">
                {log}
            </div>
            <div className="flex items-center flex-shrink-0">
                <span className="text-red-500">{prompt}</span>
                <input
                    id="metasploit-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                    className="flex-1 ml-2 bg-transparent border-none outline-none text-white"
                    disabled={isLoading}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Metasploit;
