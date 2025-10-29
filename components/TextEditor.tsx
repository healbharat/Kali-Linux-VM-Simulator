import React, { useState, useEffect, useRef } from 'react';

interface TextEditorProps {
    filePath?: string[];
    initialContent?: string;
    onSave?: (filePath: string[], content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ filePath, initialContent, onSave }) => {
    const [content, setContent] = useState(initialContent || '');
    const contentRef = useRef(content);
    
    // Keep the ref updated with the latest content to ensure the cleanup function has the most recent value
    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // This effect runs only once on mount and returns a cleanup function that runs on unmount
    useEffect(() => {
        return () => {
            // Save on unmount
            if (filePath && onSave) {
                onSave(filePath, contentRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filePath, onSave]);

    return (
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] resize-none focus:outline-none font-mono"
            spellCheck="false"
            autoFocus
        />
    );
};

export default TextEditor;