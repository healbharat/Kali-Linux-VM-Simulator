
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowState } from '../types';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  x?: number; y?: number; width?: number; height?: number;
  onUpdate: (id: string, updates: Partial<WindowState>) => void;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  otherWindows: WindowState[];
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const SNAP_THRESHOLD = 15;

const Window: React.FC<WindowProps> = (props) => {
  const { id, title, children, x = 0, y = 0, width = 640, height = 480, onUpdate, onClose, onMinimize, onFocus, zIndex, otherWindows } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [rel, setRel] = useState<{ x: number, y: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const preMaximizeState = useRef<{ x: number, y: number, width: number, height: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.window-control, .resize-handle')) return;
    if (e.button !== 0 || isMaximized) return;
    onFocus();
    setIsDragging(true);
    setRel({ x: e.pageX - x, y: e.pageY - y });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    if (e.button !== 0 || isMaximized) return;
    onFocus();
    setIsResizing(direction);
    setRel({ x: e.pageX, y: e.pageY });
    e.stopPropagation();
    e.preventDefault();
  };
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    let newX = x, newY = y, newWidth = width, newHeight = height;

    if (isDragging && rel) {
      newX = e.pageX - rel.x;
      newY = e.pageY - rel.y;

      // Snapping logic for dragging
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight - 100; // Account for dock

      if (Math.abs(newX) < SNAP_THRESHOLD) newX = 0;
      if (Math.abs(newY) < SNAP_THRESHOLD) newY = 0;
      if (Math.abs(newX + width - screenWidth) < SNAP_THRESHOLD) newX = screenWidth - width;
      if (Math.abs(newY + height - screenHeight) < SNAP_THRESHOLD) newY = screenHeight - height;
      
      // Window-to-window snapping
      otherWindows.forEach(ow => {
          if(!ow.x || !ow.y || !ow.width || !ow.height) return;
          if (Math.abs(newX - (ow.x + ow.width)) < SNAP_THRESHOLD) newX = ow.x + ow.width; // Snap to right of other
          if (Math.abs(newX + width - ow.x) < SNAP_THRESHOLD) newX = ow.x - width; // Snap to left of other
          if (Math.abs(newY - (ow.y + ow.height)) < SNAP_THRESHOLD) newY = ow.y + ow.height; // Snap to bottom of other
          if (Math.abs(newY + height - ow.y) < SNAP_THRESHOLD) newY = ow.y - height; // Snap to top of other
      });


      onUpdate(id, { x: newX, y: newY });
    }

    if (isResizing && rel) {
      const dx = e.pageX - rel.x;
      const dy = e.pageY - rel.y;
      
      if (isResizing.includes('r')) newWidth = Math.max(MIN_WIDTH, width + dx);
      if (isResizing.includes('b')) newHeight = Math.max(MIN_HEIGHT, height + dy);
      if (isResizing.includes('l')) {
        newWidth = Math.max(MIN_WIDTH, width - dx);
        newX = x + dx;
      }
      if (isResizing.includes('t')) {
        newHeight = Math.max(MIN_HEIGHT, height - dy);
        newY = y + dy;
      }
      
      setRel({ x: e.pageX, y: e.pageY });
      onUpdate(id, { x: newX, y: newY, width: newWidth, height: newHeight });
    }

    e.stopPropagation();
    e.preventDefault();
  }, [id, x, y, width, height, isDragging, isResizing, rel, onUpdate, otherWindows]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleMaximize = () => {
    onFocus();
    if (isMaximized) {
      if (preMaximizeState.current) {
        onUpdate(id, preMaximizeState.current);
      }
      setIsMaximized(false);
    } else {
      preMaximizeState.current = { x, y, width, height };
      onUpdate(id, { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 30 - 100 }); // subtract topbar and dock
      setIsMaximized(true);
    }
  };

  const windowStyles: React.CSSProperties = isMaximized ? {
    width: '100%', height: '100%', top: 0, left: 0, transform: 'none', borderRadius: 0,
  } : {
    width: `${width}px`, height: `${height}px`, left: `${x}px`, top: `${y}px`,
  };

  const resizeHandles = [
    { cursor: 'n-resize', className: 'top-0 left-0 w-full h-1.5', direction: 't' },
    { cursor: 's-resize', className: 'bottom-0 left-0 w-full h-1.5', direction: 'b' },
    { cursor: 'w-resize', className: 'top-0 left-0 w-1.5 h-full', direction: 'l' },
    { cursor: 'e-resize', className: 'top-0 right-0 w-1.5 h-full', direction: 'r' },
    { cursor: 'nw-resize', className: 'top-0 left-0 w-2.5 h-2.5', direction: 'tl' },
    { cursor: 'ne-resize', className: 'top-0 right-0 w-2.5 h-2.5', direction: 'tr' },
    { cursor: 'sw-resize', className: 'bottom-0 left-0 w-2.5 h-2.5', direction: 'bl' },
    { cursor: 'se-resize', className: 'bottom-0 right-0 w-2.5 h-2.5', direction: 'br' },
  ];

  return (
    <div
      className="absolute flex flex-col rounded-t-lg shadow-2xl bg-black/50 backdrop-blur-sm border border-[var(--color-border)] overflow-hidden"
      style={{ ...windowStyles, zIndex, transition: isMaximized ? 'all 0.2s ease' : 'none' }}
      onMouseDown={onFocus}
    >
      {!isMaximized && resizeHandles.map(handle => (
        <div
          key={handle.direction}
          className={`absolute resize-handle ${handle.className}`}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleResizeStart(e, handle.direction)}
        />
      ))}
      <div
        className="flex items-center justify-between h-8 px-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] flex-shrink-0"
        style={{ cursor: isMaximized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
        onMouseDown={handleDragStart}
        onDoubleClick={handleMaximize}
      >
        <span>{title}</span>
        <div className="flex items-center space-x-1">
          <button onClick={onMinimize} className="w-6 h-6 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-white rounded-sm transition-colors duration-150 window-control" aria-label="Minimize">&#8213;</button>
          <button onClick={handleMaximize} className="w-6 h-6 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-white rounded-sm transition-colors duration-150 window-control" aria-label="Maximize">{isMaximized ? '\u2922' : '\u2610'}</button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-danger)] hover:text-white rounded-sm transition-colors duration-150 window-control" aria-label="Close">&#10005;</button>
        </div>
      </div>
      <div className="flex-grow p-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default Window;
