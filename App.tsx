
import React, { useState, useEffect, useCallback } from 'react';
import Window from './components/Window';
import Terminal from './components/Terminal';
import SocialToolkit from './components/SocialToolkit';
import BruteForce from './components/BruteForce';
import SystemMonitor from './components/SystemMonitor';
import Taskbar from './components/Taskbar';
import ThemeSettings from './components/ThemeSettings';
import BurpSuite from './components/BurpSuite';
import BitcoinMiner from './components/BitcoinMiner';
import NmapScanner from './components/NmapScanner';
import { useTheme } from './contexts/ThemeContext';
import SplashScreen from './components/SplashScreen';
import { WindowState, FileSystem, FsNode, ClipboardItem } from './types';
import AppDrawer from './components/AppDrawer';
import TextEditor from './components/TextEditor';
import Firefox from './components/Firefox';
import Metasploit from './components/Metasploit';
import Wireshark from './components/Wireshark';
import CherryTree from './components/CherryTree';
import FileSystemExplorer from './components/FileSystemExplorer';
import TopBar from './components/TopBar';
import Htop from './components/Htop';
import Cmatrix from './components/Cmatrix';
import BraveBrowser from './components/BraveBrowser';

const initialFs: FileSystem = {
  'home': {
    'kali': {}
  },
  'root': {
      'Documents': {
        'notes.txt': 'This is a sample note file.\nYou can edit this text and close the window to save.',
      },
      'Downloads': {},
      'Desktop': {},
  },
  'etc': {
    'passwd': "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nkali:x:1000:1000:Kali User,,,:/home/kali:/bin/bash",
    'shadow': "root:$6$rounds=...:18628:0:99999:7:::",
    'ssh': {
      'sshd_config': "# This is a simulated sshd_config file.\nPermitRootLogin prohibit-password\n"
    }
  },
  'var': {
    'log': {
      'syslog': "[Simulated system logs...]\nOct 27 10:00:01 kali systemd[1]: Starting system..."
    }
  }
};


const initialWindows: Record<string, WindowState> = {
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    icon: '🖥️',
    isOpen: true,
    isMinimized: false,
    component: null, 
    isSystemApp: true,
  },
  fileSystem: {
    id: 'fileSystem',
    title: 'File System',
    icon: '📁',
    isOpen: false,
    isMinimized: false,
    component: null,
    isSystemApp: true,
  },
  textEditor: {
    id: 'textEditor',
    title: 'Text Editor',
    icon: '📝',
    isOpen: false,
    isMinimized: false,
    component: null,
  },
  firefox: {
    id: 'firefox',
    title: 'Firefox',
    icon: '🔥',
    isOpen: false,
    isMinimized: false,
    component: <Firefox />,
  },
  brave: {
      id: 'brave',
      title: 'Brave Browser',
      icon: '🦁',
      isOpen: false,
      isMinimized: false,
      component: <BraveBrowser />,
  },
  metasploit: {
    id: 'metasploit',
    title: 'Metasploit',
    icon: 'Ⓜ️',
    isOpen: false,
    isMinimized: false,
    component: <Metasploit />,
  },
  wireshark: {
    id: 'wireshark',
    title: 'Wireshark',
    icon: '🦈',
    isOpen: false,
    isMinimized: false,
    component: <Wireshark />,
  },
  burpSuite: {
    id: 'burpSuite',
    title: 'Burp Suite',
    icon: '🕷️',
    isOpen: false,
    isMinimized: false,
    component: <BurpSuite />,
  },
  cherryTree: {
    id: 'cherryTree',
    title: 'CherryTree',
    icon: '🍒',
    isOpen: false,
    isMinimized: false,
    component: <CherryTree />,
  },
  socialToolkit: {
    id: 'socialToolkit',
    title: 'Social Toolkit',
    icon: '🕵️',
    isOpen: false,
    isMinimized: false,
    component: <SocialToolkit />,
  },
  bruteForce: {
    id: 'bruteForce',
    title: 'Brute Force',
    icon: '🔐',
    isOpen: false,
    isMinimized: false,
    component: <BruteForce />,
  },
  systemMonitor: {
    id: 'systemMonitor',
    title: 'System Monitor',
    icon: '📈',
    isOpen: false,
    isMinimized: false,
    component: <SystemMonitor />,
  },
  themeSettings: {
    id: 'themeSettings',
    title: 'Theme Settings',
    icon: '🎨',
    isOpen: false,
    isMinimized: false,
    component: null,
  },
  bitcoinMiner: {
    id: 'bitcoinMiner',
    title: 'Bitcoin Miner',
    icon: '💰',
    isOpen: false,
    isMinimized: false,
    component: <BitcoinMiner />,
  },
  nmapScanner: {
    id: 'nmapScanner',
    title: 'Nmap Scanner',
    icon: '📡',
    isOpen: false,
    isMinimized: false,
    component: <NmapScanner />,
  },
  htop: {
    id: 'htop',
    title: 'Htop',
    icon: '📊',
    isOpen: false,
    isMinimized: false,
    component: <Htop />,
  },
  cmatrix: {
    id: 'cmatrix',
    title: 'CMatrix',
    icon: '🟩',
    isOpen: false,
    isMinimized: false,
    component: <Cmatrix />,
  },
};

const PINNED_APPS = ['terminal', 'fileSystem', 'brave', 'firefox', 'textEditor'];
const DEFAULT_INSTALLED_APPS = ['terminal', 'fileSystem', 'textEditor', 'firefox', 'brave', 'metasploit', 'wireshark', 'burpSuite', 'cherryTree', 'socialToolkit', 'bruteForce', 'systemMonitor', 'themeSettings', 'bitcoinMiner', 'nmapScanner'];

const App: React.FC = () => {
  const [windows, setWindows] = useState<Record<string, WindowState>>(() => {
    try {
      const savedState = JSON.parse(localStorage.getItem('windowsState') || '{}');
      const newState: Record<string, WindowState> = {};
      // Ensure all initial windows are present, then overwrite with saved state
      for (const id in initialWindows) {
        newState[id] = { ...initialWindows[id], ...(savedState[id] || {}) };
      }
      return newState;
    } catch (e) {
      return initialWindows;
    }
  });

  const [installedApps, setInstalledApps] = useState<Set<string>>(() => {
     try {
        const savedApps = localStorage.getItem('installedApps');
        return savedApps ? new Set(JSON.parse(savedApps)) : new Set(DEFAULT_INSTALLED_APPS);
     } catch(e) {
        return new Set(DEFAULT_INSTALLED_APPS);
     }
  });
  
  const [fs, setFs] = useState<FileSystem>(() => {
    try {
      const savedFs = localStorage.getItem('virtualFs');
      return savedFs ? JSON.parse(savedFs) : initialFs;
    } catch (e) {
      return initialFs;
    }
  });
  
  const [windowStack, setWindowStack] = useState<string[]>(['terminal']); 
  const [clipboard, setClipboard] = useState<ClipboardItem>(null);
  const { theme } = useTheme();
  const [isBooting, setIsBooting] = useState(true);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Effect for saving state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('virtualFs', JSON.stringify(fs));
      localStorage.setItem('installedApps', JSON.stringify(Array.from(installedApps)));
      
      const savableWindows: Partial<Record<string, Omit<WindowState, 'component'>>> = {};
      for (const id in windows) {
          const { component, ...rest } = windows[id];
          savableWindows[id] = rest;
      }
      localStorage.setItem('windowsState', JSON.stringify(savableWindows));

    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [windows, fs, installedApps]);

  const handleResetVm = () => {
    if (window.confirm("Are you sure you want to reset the VM? All files, installed apps, and window positions will be lost.")) {
        localStorage.removeItem('windowsState');
        localStorage.removeItem('virtualFs');
        localStorage.removeItem('installedApps');
        localStorage.removeItem('themeId');
        window.location.reload();
    }
  };

  const getNodeFromPath = useCallback((pathParts: string[], startNode: FileSystem | FsNode = fs): FsNode | FileSystem | null => {
    let currentNode: any = startNode;
    for (const part of pathParts) {
      if (currentNode && typeof currentNode === 'object' && currentNode[part] !== undefined) {
        currentNode = currentNode[part];
      } else {
        return null; // Path doesn't exist
      }
    }
    return currentNode;
  }, [fs]);
  
  const handleFileSave = (filePath: string[], newContent: string) => {
    setFs(currentFs => {
      const newFs = JSON.parse(JSON.stringify(currentFs));
      let parentNode: any = newFs;
      
      const parentPath = filePath.slice(0, -1);
      const fileName = filePath[filePath.length - 1];
  
      for (const part of parentPath) {
          if (parentNode && typeof parentNode === 'object' && parentNode[part] !== undefined) {
            parentNode = parentNode[part];
          } else {
              console.error("Save failed: path does not exist.");
              return currentFs;
          }
      }
  
      if (parentNode && typeof parentNode === 'object' && parentNode[fileName] !== undefined) {
        if (typeof parentNode[fileName] !== 'object') {
          parentNode[fileName] = newContent;
        } else {
          console.error("Save failed: cannot save file over a directory.");
          return currentFs;
        }
      }
      return newFs;
    });
  };

  const handleCopy = (name: string, node: FsNode) => {
    setClipboard({ name, node });
  };

  const handlePaste = (destinationCwd: string[]) => {
    if (!clipboard) return;

    setFs(currentFs => {
        const newFs = JSON.parse(JSON.stringify(currentFs)); // Deep clone
        let targetDir = getNodeFromPath(destinationCwd, newFs) as { [key: string]: FsNode };

        if (!targetDir || typeof targetDir !== 'object') {
            console.error("Paste failed: destination is not a directory.");
            return currentFs;
        }
        
        const getUniqueName = (name: string, dir: { [key: string]: FsNode }): string => {
            let newName = name;
            if (dir[newName] === undefined) return newName;

            const extIndex = name.lastIndexOf('.');
            const baseName = extIndex > -1 ? name.substring(0, extIndex) : name;
            const extension = extIndex > -1 ? name.substring(extIndex) : '';
            
            newName = `${baseName} (copy)${extension}`;
            if (dir[newName] === undefined) return newName;
            
            let i = 2;
            while (true) {
                newName = `${baseName} (copy ${i})${extension}`;
                if (dir[newName] === undefined) return newName;
                i++;
            }
        };

        const finalName = getUniqueName(clipboard.name, targetDir);
        targetDir[finalName] = JSON.parse(JSON.stringify(clipboard.node));

        return newFs;
    });
  };

  const handleCreateNode = (destinationCwd: string[], type: 'file' | 'folder') => {
    const name = window.prompt(`Enter name for new ${type}:`, `New ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (!name || !name.trim()) return;
    if (name.includes('/')) {
        alert("Error: File and folder names cannot contain slashes.");
        return;
    }

    setFs(currentFs => {
      const newFs = JSON.parse(JSON.stringify(currentFs)); // Deep clone
      let targetDir = getNodeFromPath(destinationCwd, newFs) as { [key: string]: FsNode };

      if (!targetDir || typeof targetDir !== 'object') {
          alert("Error: The destination is not a valid directory.");
          return currentFs;
      }

      if (targetDir[name] !== undefined) {
          alert(`Error: A file or folder named "${name}" already exists in this directory.`);
          return currentFs;
      }

      targetDir[name] = type === 'file' ? "" : {};

      return newFs;
    });
  };

  const handleInstallApp = (appId: string) => {
    setInstalledApps(prev => new Set(prev).add(appId));
  };
  
  const handleRemoveApp = (appId: string) => {
    setInstalledApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
    });
    if (windows[appId]?.isOpen) {
        handleClose(appId);
    }
  };

  const handleFocus = (id: string) => {
    setWindowStack(prev => [...prev.filter(winId => winId !== id), id]);
  };

  const handleOpen = (id: string, context?: { filePath?: string[] }) => {
    if (!installedApps.has(id)) {
        alert(`App "${id}" is not installed. Use 'apt install ${id}' in the terminal.`);
        return;
    }
    setWindows(prev => {
        const win = prev[id];
        let newWinState = { ...win, isOpen: true, isMinimized: false, context };

        if (newWinState.x === undefined || newWinState.y === undefined) {
            const initialWidth = window.innerWidth * 0.6;
            const initialHeight = window.innerHeight * 0.6;
            newWinState.width = Math.min(initialWidth, 800);
            newWinState.height = Math.min(initialHeight, 600);
            
            const centerX = window.innerWidth / 2 - newWinState.width / 2;
            const centerY = (window.innerHeight - 100) / 2 - newWinState.height / 2;
            
            newWinState.x = centerX + (Math.random() - 0.5) * 60;
            newWinState.y = centerY + (Math.random() - 0.5) * 60;
        }

        return { ...prev, [id]: newWinState };
    });
    handleFocus(id);
  };

  const handleClose = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, context: undefined },
    }));
    setWindowStack(prev => prev.filter(winId => winId !== id));
  };
  
  const handleMinimize = (id:string) => {
     setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
     setWindowStack(prev => prev.filter(winId => winId !== id));
  };
  
  const handleWindowUpdate = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => ({...prev, [id]: { ...prev[id], ...updates }}));
  };

  const handleTaskbarClick = (id: string) => {
    const targetWindow = windows[id];
    if (!targetWindow.isOpen) {
        handleOpen(id);
        return;
    }
    const isTopWindow = windowStack[windowStack.length - 1] === id;
    if (targetWindow.isMinimized) {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: false } }));
      handleFocus(id);
    } else {
      if (isTopWindow) handleMinimize(id);
      else handleFocus(id);
    }
  };

  if (isBooting) return <SplashScreen />;
  
  const activeWindowId = windowStack.length > 0 ? windowStack[windowStack.length - 1] : null;
  const activeWindowTitle = activeWindowId ? windows[activeWindowId]?.title : 'Finder';

  const otherWindows = Object.values(windows).filter(w => w.isOpen && !w.isMinimized);

  return (
    <main
      className="h-screen w-screen bg-cover bg-center font-mono overflow-hidden flex flex-col"
      style={{ backgroundImage: theme.colors['--wallpaper-url'] }}
    >
      <TopBar activeWindowTitle={activeWindowTitle} />
      <div className="flex-grow relative pb-[100px]"> {/* PADDING FOR DOCK */}
        {Object.values(windows).map((win: WindowState) => {
          if (!win.isOpen || win.isMinimized) return null;

          const zIndex = windowStack.indexOf(win.id) + 10;
          
          let componentToRender;
          let title = win.title;

          if (win.id === 'terminal') {
            componentToRender = <Terminal fs={fs} setFs={setFs} allApps={initialWindows} installedApps={installedApps} onInstall={handleInstallApp} onRemove={handleRemoveApp} />;
          } else if (win.id === 'fileSystem') {
            componentToRender = <FileSystemExplorer fs={fs} clipboard={clipboard} onCopy={handleCopy} onPaste={handlePaste} onCreateNode={handleCreateNode} onOpenFile={(path) => handleOpen('textEditor', { filePath: path })} />;
          } else if (win.id === 'textEditor') {
            const filePath = win.context?.filePath;
            let initialContent = '';
            if (filePath) {
              const node = getNodeFromPath(filePath, fs);
              if (typeof node === 'string') initialContent = node;
              title = `${win.title} - ${filePath[filePath.length - 1]}`;
            }
            componentToRender = <TextEditor key={filePath ? filePath.join('/') : 'default'} filePath={filePath} initialContent={initialContent} onSave={handleFileSave} />;
          } else if (win.id === 'themeSettings') {
            componentToRender = <ThemeSettings onReset={handleResetVm} />;
          }
          else { componentToRender = win.component; }

          return (
            <Window
              key={win.id}
              id={win.id}
              title={title}
              x={win.x} y={win.y} width={win.width} height={win.height}
              onUpdate={handleWindowUpdate}
              onClose={() => handleClose(win.id)}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              zIndex={zIndex}
              otherWindows={otherWindows.filter(w => w.id !== win.id)}
            >
              {componentToRender}
            </Window>
          );
        })}
      </div>
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center h-20 pointer-events-none">
          <Taskbar windows={windows} installedApps={installedApps} pinnedApps={PINNED_APPS} onItemClick={handleTaskbarClick} onAppDrawerClick={() => setIsAppDrawerOpen(true)} className="pointer-events-auto" />
      </div>

      {isAppDrawerOpen && (
        <AppDrawer allWindows={initialWindows} installedApps={installedApps} onOpenApp={(id) => { handleOpen(id); setIsAppDrawerOpen(false); }} onClose={() => setIsAppDrawerOpen(false)} />
      )}
    </main>
  );
};

export default App;
