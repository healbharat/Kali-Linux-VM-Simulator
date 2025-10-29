
import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Line, LineType, FileSystem, FsNode, WindowState } from '../types';
import { WELCOME_MESSAGES } from '../constants';
import { executeKaliCommand, simulateApt, simulateNeofetch } from '../services/geminiService';

interface TerminalProps {
  fs: FileSystem;
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
  allApps: Record<string, WindowState>;
  installedApps: Set<string>;
  onInstall: (appId: string) => void;
  onRemove: (appId: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ fs, setFs, allApps, installedApps, onInstall, onRemove }) => {
  const [lines, setLines] = useState<Line[]>(
    WELCOME_MESSAGES.map(msg => ({ type: LineType.OUTPUT, text: msg }))
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cwd, setCwd] = useState<string[]>(['root']); // Represents path /root
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const getPrompt = useCallback(() => {
    const path = `/${cwd.join('/')}`;
    const displayPath = path.replace(/^\/root$/, '~').replace(/^\/root\//, '~/');
    return `root@kali:${displayPath}#`;
  }, [cwd]);

  // --- Filesystem Helpers ---
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

  const getParentNode = useCallback((pathParts: string[], startNode: FileSystem | FsNode = fs): { parent: FsNode | FileSystem | null, finalPart: string } => {
    if (pathParts.length === 0) return { parent: null, finalPart: '' };
    const parentPath = pathParts.slice(0, -1);
    const finalPart = pathParts[pathParts.length - 1];
    const parent = getNodeFromPath(parentPath, startNode);
    return { parent, finalPart };
  }, [getNodeFromPath]);
  
  const resolvePath = useCallback((rawPath: string) => {
    if (!rawPath) return cwd;
    
    let pathParts: string[];
    if (rawPath.startsWith('/')) {
      pathParts = []; // Absolute path
    } else {
      pathParts = [...cwd]; // Relative path
    }

    if (rawPath.startsWith('~')) {
        pathParts = ['root'];
        rawPath = rawPath.substring(1);
    }
    
    const targetParts = rawPath.split('/').filter(p => p && p !== '.');

    for (const part of targetParts) {
      if (part === '..') {
        if (pathParts.length > 0) {
          pathParts.pop();
        }
      } else {
        pathParts.push(part);
      }
    }
    return pathParts;
  }, [cwd]);
  // --- End Filesystem Helpers ---

  const handleCommand = useCallback(async (command: string) => {
    setIsLoading(true);
    const [cmd, ...args] = command.trim().split(/\s+/);
    let output: Line[] = [];

    // --- Local command handling ---
    switch (cmd.toLowerCase()) {
      case 'clear':
        setLines([]);
        break;
      case 'help':
        output = [
          { type: LineType.OUTPUT, text: 'Kali Linux VM Simulator Help:' },
          { type: LineType.OUTPUT, text: '-----------------------------' },
          { type: LineType.OUTPUT, text: 'Built-in commands:' },
          { type: LineType.OUTPUT, text: '  clear                  - Clears the terminal screen.' },
          { type: LineType.OUTPUT, text: '  help                   - Shows this help message.' },
          { type: LineType.OUTPUT, text: '  ls [path]              - Lists directory contents.' },
          { type: LineType.OUTPUT, text: '  cd [dir]               - Changes the current directory.' },
          { type: LineType.OUTPUT, text: '  pwd                    - Prints the current working directory.' },
          { type: LineType.OUTPUT, text: '  mkdir [dir]            - Creates a new directory.' },
          { type: LineType.OUTPUT, text: '  touch [file]           - Creates a new empty file.' },
          { type: LineType.OUTPUT, text: '  cat [file]             - Displays the content of a file.' },
          { type: LineType.OUTPUT, text: '  rm [file/dir]          - Removes a file or empty directory.' },
          { type: LineType.OUTPUT, text: '  apt update             - Updates package lists.' },
          { type: LineType.OUTPUT, text: '  apt install [pkg]      - Installs a package (e.g., htop, cmatrix).' },
          { type: LineType.OUTPUT, text: '  apt remove [pkg]       - Removes a package.' },
          { type: LineType.OUTPUT, text: '  neofetch               - Shows fancy system information.' },
          { type: LineType.OUTPUT, text: '\nAny other command is simulated by the Gemini API.' },
        ];
        break;
      case 'pwd':
        output = [{ type: LineType.OUTPUT, text: `/${cwd.join('/')}` }];
        break;
      case 'ls': {
        const pathToList = args[0] ? resolvePath(args[0]) : cwd;
        const node = getNodeFromPath(pathToList);
        if (node && typeof node === 'object') {
          const contents = Object.keys(node);
          if (contents.length > 0) {
             output = [{ type: LineType.OUTPUT, text: contents.join('  ') }];
          }
        } else {
           output = [{ type: LineType.ERROR, text: `ls: cannot access '${args[0] || '.'}': No such file or directory` }];
        }
        break;
      }
      case 'cd': {
        const targetPath = args[0] || '~';
        const newPathParts = resolvePath(targetPath);
        const node = getNodeFromPath(newPathParts);
        if (node && typeof node === 'object') {
          setCwd(newPathParts);
        } else {
          output = [{ type: LineType.ERROR, text: `bash: cd: ${targetPath}: No such file or directory` }];
        }
        break;
      }
      case 'mkdir': {
        const dirName = args[0];
        if (!dirName) {
            output = [{ type: LineType.ERROR, text: 'mkdir: missing operand' }];
        } else {
            let newFs = JSON.parse(JSON.stringify(fs));
            let parentNode = getNodeFromPath(cwd, newFs) as {[key: string]: FsNode};
            if (parentNode && typeof parentNode === 'object') {
                if (parentNode[dirName]) {
                    output = [{ type: LineType.ERROR, text: `mkdir: cannot create directory ‘${dirName}’: File exists` }];
                } else {
                    parentNode[dirName] = {};
                    setFs(newFs);
                }
            }
        }
        break;
      }
      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
            output = [{ type: LineType.ERROR, text: 'touch: missing file operand' }];
        } else {
            let newFs = JSON.parse(JSON.stringify(fs));
            let parentNode = getNodeFromPath(cwd, newFs) as {[key: string]: FsNode};
            if (parentNode && typeof parentNode === 'object' && !parentNode[fileName]) {
                parentNode[fileName] = null;
                setFs(newFs);
            }
        }
        break;
      }
      case 'cat': {
        const fileName = args[0];
        if (!fileName) break;
        const path = resolvePath(fileName);
        const node = getNodeFromPath(path);

        if (typeof node === 'string') {
          output = node.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));
        } else if (node === null) {
          // Empty file, no output
        } else if (node && typeof node === 'object') {
          output = [{ type: LineType.ERROR, text: `cat: ${fileName}: Is a directory` }];
        } else {
          output = [{ type: LineType.ERROR, text: `cat: ${fileName}: No such file or directory` }];
        }
        break;
      }
      case 'rm': {
        const targetName = args[0];
        if (!targetName) {
            output = [{ type: LineType.ERROR, text: 'rm: missing operand' }];
        } else {
            const path = resolvePath(targetName);
            const node = getNodeFromPath(path);
            if (node === null || typeof node === 'string') { // It's a file
                let newFs = JSON.parse(JSON.stringify(fs));
                const { parent, finalPart } = getParentNode(path, newFs);
                if (parent && typeof parent === 'object') {
                    delete (parent as {[key:string]: FsNode})[finalPart];
                    setFs(newFs);
                }
            } else if (typeof node === 'object') { // It's a directory
                if (Object.keys(node).length === 0) {
                    let newFs = JSON.parse(JSON.stringify(fs));
                    const { parent, finalPart } = getParentNode(path, newFs);
                    if (parent && typeof parent === 'object') {
                        delete (parent as {[key:string]: FsNode})[finalPart];
                        setFs(newFs);
                    }
                } else {
                    output = [{ type: LineType.ERROR, text: `rm: cannot remove '${targetName}': Directory not empty` }];
                }
            } else {
                output = [{ type: LineType.ERROR, text: `rm: cannot remove '${targetName}': No such file or directory` }];
            }
        }
        break;
      }
      case 'git': {
         if (args[0] === 'clone' && args[1]) {
            const result = await executeKaliCommand(command);
            output = result.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));

            const repoNameMatch = args[1].match(/([^\/]+?)(?:\.git)?$/);
            if (repoNameMatch) {
                const repoName = repoNameMatch[1];
                let newFs = JSON.parse(JSON.stringify(fs));
                let parentNode = getNodeFromPath(cwd, newFs) as {[key:string]: FsNode};
                if (parentNode && typeof parentNode === 'object' && !parentNode[repoName]) {
                    parentNode[repoName] = {
                      '.git': {}, 'README.md': '# README', 'LICENSE': 'MIT License', 'src': {}
                    };
                    setFs(newFs);
                }
            }
         } else {
             const result = await executeKaliCommand(command);
             output = result.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));
         }
         break;
      }
      case 'apt': {
        const action = args[0];
        const pkgName = args[1];
        
        const simulationResult = await simulateApt(args);
        output = simulationResult.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));

        if (action === 'install' && pkgName) {
            if (allApps[pkgName]) {
                if (installedApps.has(pkgName)) {
                    output.push({ type: LineType.OUTPUT, text: `${pkgName} is already the newest version (2.0.1-kali1).` });
                } else {
                    onInstall(pkgName);
                    // This message is now part of the AI sim, making it more realistic
                }
            } else {
                output.push({ type: LineType.ERROR, text: `E: Unable to locate package ${pkgName}` });
            }
        } else if (action === 'remove' && pkgName) {
            if (allApps[pkgName] && allApps[pkgName].isSystemApp) {
                 output.push({ type: LineType.OUTPUT, text: `\nNote: Package '${pkgName}' is an essential system component and cannot be removed.` });
            } else if (installedApps.has(pkgName)) {
                onRemove(pkgName);
                 // This message is now part of the AI sim
            } else {
                output.push({ type: LineType.ERROR, text: `\nE: Package '${pkgName}' is not installed, so not removed` });
            }
        }
        break;
      }
      case 'neofetch': {
        const result = await simulateNeofetch();
        output = result.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));
        break;
      }
      default:
        // --- Fallback to Gemini API ---
        const result = await executeKaliCommand(command);
        output = result.split('\n').map(line => ({ type: LineType.OUTPUT, text: line }));
    }
    
    setLines(prev => [...prev, ...output]);
    setIsLoading(false);
  }, [cwd, fs, setFs, getNodeFromPath, resolvePath, getParentNode, allApps, installedApps, onInstall, onRemove]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = inputValue.trim();
      setLines(prev => [...prev, { type: LineType.INPUT, text: command }]);
      if (command) {
        setHistory(prev => [command, ...prev]);
        setHistoryIndex(-1);
        handleCommand(command);
      }
      setInputValue('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInputValue(history[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInputValue(history[newIndex]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInputValue('');
        }
    }
  };

  const renderLine = (line: Line, index: number) => {
    let lineClass = "text-[var(--color-text-secondary)]";
    if (line.type === LineType.ERROR) {
        lineClass = "text-[var(--color-accent-danger)]";
    }
    
    if (line.type === LineType.INPUT) {
      return (
        <div key={index}>
          <span className="text-[var(--color-accent-danger)]">{getPrompt()}</span>
          <span className="ml-2 text-[var(--color-text-primary)]">{line.text}</span>
        </div>
      );
    }
    return <div key={index} className={`${lineClass} whitespace-pre-wrap`}>{line.text}</div>;
  };

  return (
    <div
      className="h-full w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] p-2 overflow-y-auto"
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map(renderLine)}
      {!isLoading && (
        <div className="flex items-center">
          <span className="text-[var(--color-accent-danger)]">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 ml-2 bg-transparent border-none outline-none text-[var(--color-text-primary)]"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      )}
       {isLoading && (
        <div className="flex items-center">
            <span className="text-[var(--color-accent-danger)]">{getPrompt()}</span>
            <span className="ml-2 h-4 w-2 bg-white animate-pulse"></span>
        </div>
      )}
    </div>
  );
};

export default Terminal;