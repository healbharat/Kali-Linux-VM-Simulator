
export enum LineType {
  INPUT = 'input',
  OUTPUT = 'output',
  ERROR = 'error',
}

export interface Line {
  type: LineType;
  text: string;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  component: React.ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isSystemApp?: boolean; // To protect core apps from being uninstalled
  context?: {
    filePath?: string[];
  };
}

// A directory is an object, a file can be a string (with content) or null (empty).
export type FsNode = { [key: string]: FsNode } | string | null;
export type FileSystem = { [key: string]: FsNode };

export type ClipboardItem = {
  name: string;
  node: FsNode;
} | null;