import React, { useState, useEffect } from 'react';
import { simulateWireshark } from '../services/geminiService';

const Wireshark: React.FC = () => {
    const [packets, setPackets] = useState<string>('Initializing capture...');
    const [isLoading, setIsLoading] = useState(true);

    const startCapture = async () => {
        setIsLoading(true);
        setPackets('Capturing network traffic...');
        const result = await simulateWireshark();
        setPackets(result);
        setIsLoading(false);
    };

    useEffect(() => {
        startCapture();
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#222831] text-gray-200 font-mono text-xs">
            {/* Toolbar */}
            <div className="flex-shrink-0 p-2 bg-[#393E46] flex items-center gap-2 border-b border-gray-900">
                <button onClick={startCapture} disabled={isLoading} className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white px-3 py-1 rounded text-sm">
                    {isLoading ? '...' : '▶ Start'}
                </button>
                 <span className="text-sm text-gray-400">Wireshark Network Analyzer</span>
            </div>
            
            {/* Packet List */}
            <div className="flex-grow overflow-auto p-2 whitespace-pre">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">Capturing packets...</div>
                ) : (
                    packets
                )}
            </div>
        </div>
    );
};

export default Wireshark;
