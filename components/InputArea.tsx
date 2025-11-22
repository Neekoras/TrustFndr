import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Globe, Search, ArrowUp } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, placeholder }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Auto-resize
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
        <div className="relative flex flex-col bg-card border border-input rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all overflow-hidden">
            
            <textarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Ask anything about a company..."}
                disabled={disabled}
                rows={1}
                className="w-full p-4 pr-12 bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none max-h-[150px] overflow-y-auto"
            />
            
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors" title="Attach file (demo)">
                        <Paperclip size={18} />
                    </button>
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                        <Globe size={12} />
                        <span>Search Active</span>
                    </div>
                </div>
                
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || disabled}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                        input.trim() && !disabled
                            ? 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                    <ArrowUp size={18} />
                </button>
            </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
            TrustFundr can make mistakes. Please verify important financial information.
        </p>
    </div>
  );
};

export default InputArea;