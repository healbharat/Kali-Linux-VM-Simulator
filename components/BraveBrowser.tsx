import React, { useState, FormEvent } from 'react';

const BraveBrowser: React.FC = () => {
    const [url, setUrl] = useState('https://duckduckgo.com');
    const [iframeSrc, setIframeSrc] = useState('https://duckduckgo.com');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGo = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        // Add https:// if missing
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }
        setIframeSrc(finalUrl);
        // The loading state will be turned off by the iframe's onload or onerror event
    };
    
    // The progress bar needs a key to force a re-render and restart the animation
    const progressKey = Date.now();

    return (
        <div className="h-full flex flex-col bg-[#333544] font-sans">
            <div className="flex-shrink-0 p-2 bg-[#1e2029] flex items-center gap-2 border-b border-black">
                <form onSubmit={handleGo} className="flex-grow">
                    <input 
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#2a2c37] text-gray-200 rounded-md px-4 py-1 text-sm focus:outline-none focus:ring-2 ring-orange-500"
                        placeholder="Search or enter address"
                    />
                </form>
            </div>
            <div className="flex-grow bg-gray-100 relative">
                {isLoading && <div key={progressKey} className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-progress"></div>}
                
                <iframe
                    src={iframeSrc}
                    className="w-full h-full border-none"
                    title="Brave Browser"
                    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    referrerPolicy="no-referrer"
                    onLoad={() => {
                        setIsLoading(false);
                        setError(null);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setError(`Could not load the page: ${iframeSrc}. The website may be preventing it from being embedded.`);
                    }}
                ></iframe>

                {error && (
                     <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-200 p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
                        <p className="max-w-md text-center text-gray-600">
                           {error}
                        </p>
                     </div>
                )}
                 <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white p-1 rounded">
                    Note: Some websites block embedding.
                </div>
            </div>
        </div>
    );
};

export default BraveBrowser;