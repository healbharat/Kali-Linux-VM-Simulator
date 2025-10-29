
import React from 'react';
import { useTheme, themes } from '../contexts/ThemeContext';

interface ThemeSettingsProps {
    onReset: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onReset }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 space-y-4 font-mono">
      <div>
        <h2 className="text-lg text-center text-[var(--color-accent)] border-b pb-2" style={{ borderColor: 'var(--color-accent-dark)' }}>
          Appearance Settings
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          Select a theme to change the look and feel of the entire VM simulator.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          {Object.values(themes).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                theme.id === t.id ? 'border-[var(--color-accent)] scale-105' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
              }`}
            >
              <div className="text-lg font-bold mb-2">{t.name}</div>
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors['--color-bg-secondary'] as string }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors['--color-accent'] as string }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors['--color-accent-danger'] as string }}></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
         <h3 className="text-md text-center text-[var(--color-accent-danger)]">System Reset</h3>
         <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-3 text-center">
            This will clear all saved data (files, installed apps, window positions) and reset the VM to its original state.
         </p>
         <button
            onClick={onReset}
            className="w-full text-center py-2 bg-[var(--color-accent-danger)] text-white rounded-md hover:bg-red-600 transition-colors"
        >
            Reset VM State
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
