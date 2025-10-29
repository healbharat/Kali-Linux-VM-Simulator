
import React from 'react';

interface DesktopIconProps {
  icon: string;
  name: string;
  onDoubleClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, name, onDoubleClick }) => {
  return (
    <div
      className="flex flex-col items-center justify-center w-24 h-24 text-white cursor-pointer group"
      onDoubleClick={onDoubleClick}
    >
      <div className="text-4xl transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="mt-1 text-sm text-center select-none shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">
        {name}
      </span>
    </div>
  );
};

export default DesktopIcon;
