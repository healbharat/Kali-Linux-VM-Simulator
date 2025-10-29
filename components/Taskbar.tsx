
import React from 'react';
import { WindowState } from '../types';

interface TaskbarProps {
  windows: Record<string, WindowState>;
  installedApps: Set<string>;
  pinnedApps: string[];
  onItemClick: (id: string) => void;
  onAppDrawerClick: () => void;
  className?: string;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, installedApps, pinnedApps, onItemClick, onAppDrawerClick, className }) => {
  const openWindows = Object.values(windows).filter((w: WindowState) => w.isOpen);
  
  // Create a set for quick lookup of open apps
  const openAppIds = new Set(openWindows.map(w => w.id));
  const pinnedAndInstalled = pinnedApps.filter(id => installedApps.has(id));
  const pinnedAppIds = new Set(pinnedAndInstalled);
  
  // Combine pinned apps and any open, non-pinned apps
  const dockItems = [
    ...pinnedAndInstalled,
    ...openWindows.filter(w => !pinnedAppIds.has(w.id)).map(w => w.id)
  ];
  const uniqueDockItems = [...new Set(dockItems)];

  return (
    <div className={`flex items-end justify-center h-full ${className}`}>
      <div className="flex items-center space-x-2 p-2 rounded-2xl bg-[var(--color-bg-secondary)] backdrop-blur-md border border-[var(--color-border)] shadow-lg">
        {uniqueDockItems.map(id => {
          const win = windows[id];
          if (!win) return null;

          return (
            <button
              key={win.id}
              className="flex flex-col items-center justify-center group cursor-pointer w-12"
              onClick={() => onItemClick(win.id)}
              title={win.title}
            >
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                {win.icon}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1 transition-colors duration-200 ${
                  openAppIds.has(win.id) ? 'bg-gray-400' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
        
        <div className="h-10 w-px bg-[var(--color-border)] mx-2 self-center"></div>

        <button
          className="flex flex-col items-center justify-center group cursor-pointer w-12"
          onClick={onAppDrawerClick}
          title="Show Applications"
        >
          <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
            ⣿
          </span>
           <div className="w-1.5 h-1.5 rounded-full mt-1 bg-transparent" />
        </button>
      </div>
    </div>
  );
};

export default Taskbar;