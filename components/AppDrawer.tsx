
import React from 'react';
import DesktopIcon from './DesktopIcon';
import { WindowState } from '../types';

interface AppDrawerProps {
  allWindows: Record<string, WindowState>;
  installedApps: Set<string>;
  onOpenApp: (id: string) => void;
  onClose: () => void;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ allWindows, installedApps, onOpenApp, onClose }) => {
  // Prevent closing when clicking inside the content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const visibleApps = Object.values(allWindows)
    .filter(win => installedApps.has(win.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-8 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-8"
        onClick={handleContentClick}
      >
        {visibleApps.map(win => (
          <DesktopIcon
            key={win.id}
            icon={win.icon}
            name={win.title}
            onDoubleClick={() => onOpenApp(win.id)}
          />
        ))}
         <DesktopIcon
            icon="🗑️"
            name="Trash"
            onDoubleClick={() => {
                alert('Trash is empty!');
                onClose();
            }}
          />
      </div>
    </div>
  );
};

export default AppDrawer;