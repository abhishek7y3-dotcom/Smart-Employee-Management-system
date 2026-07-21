import React, { useRef, useState } from 'react';
import { Send, Plus, X, FileText } from 'lucide-react';

export const ChatInput = ({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) => {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || attachedFile) && !disabled) {
      let finalMessage = text;
      
      if (attachedFile) {
        finalMessage = `[Document Attached: ${attachedFile.name}]\n\n${attachedFile.content}\n\nUser Question: ${text}`;
      }
      
      onSend(finalMessage);
      setText('');
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content });
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        
        {/* Attached File Badge */}
        {attachedFile && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm w-fit">
            <FileText size={16} />
            <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
            <button 
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute left-2 p-2 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md,.json,.csv" 
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your tasks or team..."
            className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-12 text-sm focus:ring-2 focus:ring-blue-500 resize-none h-[48px] overflow-hidden leading-tight"
            disabled={disabled}
            rows={1}
          />
          <button
            type="submit"
            disabled={(!text.trim() && !attachedFile) || disabled}
            className="absolute right-2 p-2 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
