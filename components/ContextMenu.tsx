
import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; onClick: () => void; disabled?: boolean }[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md shadow-lg py-1 z-[100] w-36"
      style={{ top: y, left: x }}
    >
      {options.map((option, index) => {
        if (option.label === '---') {
            return <hr key={index} className="border-[var(--color-border)] my-1" />;
        }
        return (
            <button
                key={index}
                onClick={option.onClick}
                disabled={option.disabled}
                className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-accent-hover)] disabled:text-gray-500 disabled:hover:bg-[var(--color-bg-secondary)] disabled:cursor-not-allowed"
                >
                {option.label}
            </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;