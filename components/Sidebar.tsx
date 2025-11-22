import React from 'react';
import { LayoutDashboard, Building2, Plus, Moon, Sun, MessageSquare, Briefcase, Search, ShieldCheck } from 'lucide-react';
import { AppMode, ChatSession } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  setMode,
  isDarkMode,
  toggleTheme,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession
}) => {
  return (
    <div className="w-[260px] h-screen bg-sidebar flex flex-col flex-shrink-0 text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-sidebar-foreground">
            TrustFundr
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 rounded-md transition-all shadow-sm text-sm"
        >
            <Plus size={16} />
            New chat
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="px-3 pb-4 border-b border-sidebar-border">
        <p className="px-2 text-xs font-medium text-sidebar-foreground/60 uppercase mb-2 tracking-wider">Mode</p>
        <div className="space-y-1">
            <button
                onClick={() => setMode(AppMode.INVESTOR)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                currentMode === AppMode.INVESTOR
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
            >
                <Search size={16} />
                Investor Research
            </button>
            <button
                onClick={() => setMode(AppMode.COMPANY)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                currentMode === AppMode.COMPANY
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
            >
                <ShieldCheck size={16} />
                Company Audit
            </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto mt-4 px-3 scrollbar-hide">
        <div className="px-2 mb-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
          {currentMode === AppMode.INVESTOR ? 'Research History' : 'Audit Logs'}
        </div>
        <div className="space-y-1">
          {sessions.filter(s => s.mode === currentMode).map((session) => (
            <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left truncate group ${
                    currentSessionId === session.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
            >
                <span className="truncate flex-1">{session.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile / Footer */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <div className="flex items-center justify-between px-2 py-2 hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
                    D
                </div>
                <span className="text-sm font-medium text-sidebar-foreground">Demo User</span>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;