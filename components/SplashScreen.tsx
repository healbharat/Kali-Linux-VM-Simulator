import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-gray-200 animate-fadeIn">
      <div className="w-48 h-48 mb-8" style={{ animation: 'pulse 2s infinite ease-in-out' }}>
        <img 
          src="https://www.kali.org/images/kali-dragon-icon.svg" 
          alt="Kali Linux Dragon Logo" 
          className="w-full h-full"
        />
      </div>
      <h1 className="text-3xl mb-4">Kali Linux VM Simulator</h1>
      <div className="w-1/3 max-w-sm bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div className="bg-green-500 h-2.5 rounded-full" style={{ animation: 'progress 3s ease-out forwards' }}></div>
      </div>
      <p className="mt-4 text-sm text-gray-400">Booting system...</p>
    </div>
  );
};

export default SplashScreen;