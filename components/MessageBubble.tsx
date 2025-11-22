import React from 'react';
import { User, Bot, ExternalLink, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Markdown parser
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
        // Headers
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-3">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-4 border-b border-border pb-2">{line.replace('## ', '')}</h2>;
        
        // Lists
        if (line.trim().startsWith('- ')) {
            return (
                <div key={i} className="flex items-start gap-2 mb-2 ml-1">
                    <span className="mt-2 w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0" />
                    <p className="leading-relaxed text-foreground/90">
                         {line.trim().substring(2).split('**').map((part, idx) => 
                            idx % 2 === 1 ? <strong key={idx} className="font-semibold text-foreground">{part}</strong> : part
                        )}
                    </p>
                </div>
            );
        }

        // Special verification badges (for Company Mode)
        if (line.includes('✅ Verified')) {
             return (
                 <div key={i} className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-md my-2 border border-green-500/20">
                     <CheckCircle2 size={16} />
                     <span className="text-sm font-medium">{line}</span>
                 </div>
             )
        }
        if (line.includes('⚠️ Could not verify')) {
             return (
                 <div key={i} className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-2 rounded-md my-2 border border-yellow-500/20">
                     <AlertTriangle size={16} />
                     <span className="text-sm font-medium">{line}</span>
                 </div>
             )
        }

        // Bold text handling
        const parts = line.split('**');
        return (
            <p key={i} className={`mb-3 leading-7 text-foreground/90 ${line.trim() === '' ? 'h-0' : ''}`}>
                {parts.map((part, idx) => 
                    idx % 2 === 1 ? <strong key={idx} className="font-semibold text-foreground">{part}</strong> : part
                )}
            </p>
        );
    });
  };

  return (
    <div className={`w-full py-6 border-b border-border/40 ${isUser ? 'bg-background' : 'bg-muted/30'}`}>
        <div className="max-w-3xl mx-auto px-4 flex gap-6">
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 border ${
                isUser ? 'bg-background border-border text-muted-foreground' : 'bg-primary border-primary text-primary-foreground'
            }`}>
                {isUser ? <User size={16} /> : <Bot size={18} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1 text-foreground">
                    {isUser ? 'You' : 'TrustFundr AI'}
                </div>
                
                <div className="text-base">
                   {message.isThinking ? (
                       <div className="flex items-center gap-2 text-muted-foreground animate-pulse mt-2">
                           <Loader2 size={16} className="animate-spin" />
                           <span>Researching & Verifying...</span>
                       </div>
                   ) : renderContent(message.text)}
                </div>

                {/* Sources / Grounding */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {message.sources.map((source, idx) => (
                            <a 
                                key={idx} 
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs text-muted-foreground"
                            >
                                <span className="truncate max-w-[200px]">{source.title}</span>
                                <span className="text-muted-foreground/60 text-[10px] ml-1">Source</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MessageBubble;