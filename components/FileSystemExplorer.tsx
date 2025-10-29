

import React, { useState, useMemo, useCallback } from 'react';
import { FileSystem, FsNode, ClipboardItem } from '../types';
import ContextMenu from './ContextMenu';

interface FileSystemExplorerProps {
  fs: FileSystem;
  clipboard: ClipboardItem;
  onCopy: (name: string, node: FsNode) => void;
  onPaste: (destinationCwd: string[]) => void;
  onCreateNode: (destinationCwd: string[], type: 'file' | 'folder') => void;
  onOpenFile: (path: string[]) => void;
}

const FileSystemExplorer: React.FC<FileSystemExplorerProps> = ({ fs, clipboard, onCopy, onPaste, onCreateNode, onOpenFile }) => {
  const [cwd, setCwd] = useState<string[]>(['root']);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    options: { label: string; onClick: () => void; disabled?: boolean }[];
  } | null>(null);


  const getNodeFromPath = useCallback((pathParts: string[], startNode: FileSystem | FsNode = fs): FsNode | FileSystem | null => {
    let currentNode: any = startNode;
    for (const part of pathParts) {
      if (currentNode && typeof currentNode === 'object' && currentNode[part] !== undefined) {
        currentNode = currentNode[part];
      } else {
        return null;
      }
    }
    return currentNode;
  }, [fs]);

  const currentDirectoryNode = useMemo(() => getNodeFromPath(cwd, fs), [cwd, fs, getNodeFromPath]);

  const handleDoubleClick = (name: string, node: FsNode) => {
    if (node !== null && typeof node === 'object') {
      // It's a directory, navigate into it
      setCwd(prev => [...prev, name]);
    } else {
      // It's a file, open it
      onOpenFile([...cwd, name]);
    }
  };

  const navigateUp = () => {
    if (cwd.length > 0) {
      setCwd(prev => prev.slice(0, -1));
    }
  };
  
  const closeContextMenu = () => setContextMenu(null);

  const handleItemRightClick = (e: React.MouseEvent, name: string, node: FsNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        {
          label: 'Copy',
          onClick: () => {
            onCopy(name, node);
            closeContextMenu();
          },
        },
      ],
    });
  };

  const handleBackgroundRightClick = (e: React.MouseEvent) => {
    // prevent right clicking on an item from triggering this
    if (e.target !== e.currentTarget) return;
    
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        {
          label: 'New Folder',
          onClick: () => {
            onCreateNode(cwd, 'folder');
            closeContextMenu();
          },
        },
        {
          label: 'New File',
          onClick: () => {
            onCreateNode(cwd, 'file');
            closeContextMenu();
          },
        },
        { label: '---', onClick: () => {} },
        {
          label: 'Paste',
          onClick: () => {
            onPaste(cwd);
            closeContextMenu();
          },
          disabled: !clipboard,
        },
      ],
    });
  };

  const getSortedContents = () => {
    if (!currentDirectoryNode || typeof currentDirectoryNode !== 'object') return [];
    
    return Object.entries(currentDirectoryNode).sort(([aName, aNode], [bName, bNode]) => {
      const aIsDir = aNode !== null && typeof aNode === 'object';
      const bIsDir = bNode !== null && typeof bNode === 'object';
      if (aIsDir && !bIsDir) return -1; // Directories first
      if (!aIsDir && bIsDir) return 1;
      return aName.localeCompare(bName); // Then sort alphabetically
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans text-sm">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <button
          onClick={navigateUp}
          disabled={cwd.length === 0}
          className="px-2 py-1 rounded hover:bg-[var(--color-border)] disabled:opacity-50"
          title="Go to parent directory"
        >
          ⬆️
        </button>
        <div className="flex-grow bg-[var(--color-bg-primary)] px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)]">
          /{cwd.join('/')}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow p-2 overflow-y-auto" onContextMenu={handleBackgroundRightClick} onClick={closeContextMenu}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {getSortedContents().map(([name, node]) => (
            <div
              key={name}
              onDoubleClick={() => handleDoubleClick(name, node)}
              onContextMenu={(e) => handleItemRightClick(e, name, node)}
              className="flex flex-col items-center p-2 rounded hover:bg-[var(--color-border)] cursor-pointer"
              title={name}
            >
              <span className="text-4xl mb-1">{node !== null && typeof node === 'object' ? '📁' : '📄'}</span>
              <span className="text-center break-all w-full truncate">{name}</span>
            </div>
          ))}
          {getSortedContents().length === 0 && (
             <div className="col-span-full text-center text-[var(--color-text-secondary)] mt-8">
                This directory is empty.
             </div>
          )}
        </div>
        {contextMenu && (
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                options={contextMenu.options}
                onClose={closeContextMenu}
            />
        )}
      </div>
    </div>
  );
};

export default FileSystemExplorer;