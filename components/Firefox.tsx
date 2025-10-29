import React, { useState } from 'react';

const Firefox: React.FC = () => {
    const [url, setUrl] = useState('https://www.kali.org');
    const [iframeSrc, setIframeSrc] = useState('');

    const handleGo = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a simulation. For security reasons (X-Frame-Options), most sites
        // can't be iframed. We will show a notice instead of a broken iframe.
        setIframeSrc(url);
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 font-sans">
            <div className="flex-shrink-0 p-2 bg-[var(--color-bg-secondary)] flex items-center gap-2 border-b border-[var(--color-border)]">
                <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                </div>
                <form onSubmit={handleGo} className="flex-grow">
                    <input 
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-md px-4 py-1 text-sm focus:outline-none focus:ring-2 ring-[var(--color-accent)]"
                    />
                </form>
            </div>
            <div className="flex-grow bg-white relative">
                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-200 p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold mb-2">Simulation Notice</h2>
                    <p className="max-w-md text-center text-gray-600">
                        For security reasons, embedding live websites is restricted in this simulated environment. 
                        This feature is for UI demonstration purposes only.
                    </p>
                    {iframeSrc && (
                        <p className="mt-4 text-sm text-gray-500 bg-gray-300 px-2 py-1 rounded">
                            Attempted to load: {iframeSrc}
                        </p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default Firefox;
