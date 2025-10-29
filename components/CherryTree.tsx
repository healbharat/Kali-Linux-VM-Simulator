import React, { useState, useMemo } from 'react';

// Using a simple type for the node structure
type NoteNode = {
  id: string;
  name: string;
  content: string;
  children: NoteNode[];
};

// Initial data to make the app feel alive
const initialNotes: NoteNode[] = [
  { 
    id: 'root-1', 
    name: 'Welcome', 
    content: 'Welcome to CherryTree!\n\nThis is a simple, hierarchical note-taking application. Click on a note on the left to view or edit its content here.\n\nUse the buttons to add or delete notes.', 
    children: [] 
  },
  {
    id: 'root-2',
    name: 'My Project',
    content: 'Project ideas and plans.',
    children: [
        { id: 'child-1', name: 'To-Do List', content: '- Design UI\n- Implement backend\n- Deploy', children: [] },
        { id: 'child-2', name: 'Meeting Notes', content: 'Meeting with the team on Monday.', children: [] },
    ]
  }
];

// Recursive helper functions for immutable updates
const findNode = (nodes: NoteNode[], nodeId: string): NoteNode | null => {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        const found = findNode(node.children, nodeId);
        if (found) return found;
    }
    return null;
};

const updateNode = (nodes: NoteNode[], nodeId: string, newContent: string): NoteNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            return { ...node, content: newContent };
        }
        return { ...node, children: updateNode(node.children, nodeId, newContent) };
    });
};

const addNodeToTree = (nodes: NoteNode[], parentId: string | null): NoteNode[] => {
    const newNodeName = prompt("Enter note name:", "New Note");
    if (!newNodeName) return nodes;

    const newNode: NoteNode = {
        id: `node-${Date.now()}`,
        name: newNodeName,
        content: '',
        children: [],
    };

    if (!parentId) {
        return [...nodes, newNode]; // Add to root
    }

    // This is a simplified implementation for adding a child to the selected node.
    // A more robust solution would handle adding children to nested nodes.
    const addRecursive = (nodes: NoteNode[], pId: string): NoteNode[] => {
       return nodes.map(node => {
            if (node.id === pId) {
                return { ...node, children: [...node.children, newNode] };
            }
            return { ...node, children: addRecursive(node.children, pId) };
        });
    }

    return addRecursive(nodes, parentId);
};

const deleteNodeFromTree = (nodes: NoteNode[], nodeId: string): NoteNode[] => {
    return nodes.filter(node => node.id !== nodeId).map(node => {
        return { ...node, children: deleteNodeFromTree(node.children, nodeId) };
    });
};


const CherryTree: React.FC = () => {
    const [nodes, setNodes] = useState<NoteNode[]>(initialNotes);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root-1');

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return findNode(nodes, selectedNodeId);
    }, [nodes, selectedNodeId]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!selectedNodeId) return;
        const newNodes = updateNode(nodes, selectedNodeId, e.target.value);
        setNodes(newNodes);
    };

    const handleAddNode = () => {
        // Adds a new node as a child of the selected node, or as a root node if none is selected
        const newNodes = addNodeToTree(nodes, selectedNodeId);
        setNodes(newNodes);
    };

    const handleDeleteNode = () => {
        if (!selectedNodeId) return;
        if (window.confirm(`Are you sure you want to delete "${selectedNode?.name}"?`)) {
            const newNodes = deleteNodeFromTree(nodes, selectedNodeId);
            setNodes(newNodes);
            setSelectedNodeId(null); // Deselect after deletion
        }
    };
    
    const renderNode = (node: NoteNode, level = 0) => (
        <div key={node.id}>
            <div
                onClick={() => setSelectedNodeId(node.id)}
                className={`py-1 cursor-pointer text-sm truncate ${selectedNodeId === node.id ? 'bg-[var(--color-accent-dark)] text-white' : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'}`}
                style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
            >
                <span className="mr-2">{node.children.length > 0 ? '▾' : '•'}</span>
                {node.name}
            </div>
            {node.children && node.children.map(child => renderNode(child, level + 1))}
        </div>
    );

    return (
        <div className="h-full flex flex-row bg-[var(--color-bg-primary)] font-sans">
            {/* Left Pane: Tree View */}
            <div className="w-1/3 min-w-[150px] max-w-[250px] flex flex-col border-r border-[var(--color-border)]">
                <div className="flex-shrink-0 p-2 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">Notes</span>
                    <div className="space-x-1">
                        <button onClick={handleAddNode} title="Add Note" className="px-2 py-1 text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-accent-hover)] rounded text-[var(--color-text-primary)]">+</button>
                        <button onClick={handleDeleteNode} disabled={!selectedNodeId} title="Delete Note" className="px-2 py-1 text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-accent-danger)] rounded text-[var(--color-text-primary)] disabled:opacity-50">-</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {nodes.map(node => renderNode(node))}
                </div>
            </div>

            {/* Right Pane: Editor */}
            <div className="w-2/3 flex-grow flex flex-col">
                {selectedNode ? (
                    <textarea
                        value={selectedNode.content}
                        onChange={handleContentChange}
                        className="w-full h-full p-4 bg-transparent text-[var(--color-text-primary)] resize-none focus:outline-none"
                        placeholder="Enter your notes here..."
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                        Select a note to view or edit.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CherryTree;
