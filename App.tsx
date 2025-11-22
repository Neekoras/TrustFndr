import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { AppMode, ChatSession, Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { Sparkles, Building2, ShieldCheck, LineChart } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.INVESTOR);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSessionId, sessions]);

  // Helpers
  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);
  
  const createNewSession = () => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
        mode: mode,
        createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleSendMessage = async (text: string) => {
    let session = getCurrentSession();
    
    // Create session if none exists
    if (!session) {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
            messages: [],
            mode: mode,
            createdAt: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        session = newSession;
    }

    // Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: text,
        timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
        s.id === session!.id 
            ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? text.slice(0, 30) : s.title }
            : s
    ));

    setIsProcessing(true);

    // Add Placeholder "Thinking" Message
    const thinkingId = (Date.now() + 1).toString();
    const thinkingMsg: Message = {
        id: thinkingId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
        isThinking: true
    };
    
    setSessions(prev => prev.map(s => 
        s.id === session!.id 
            ? { ...s, messages: [...s.messages, thinkingMsg] }
            : s
    ));

    // API Call
    const history = session.messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await sendMessageToGemini(text, mode, history);

    // Update with Real Response
    setSessions(prev => prev.map(s => 
        s.id === session!.id 
            ? { 
                ...s, 
                messages: s.messages.map(m => 
                    m.id === thinkingId 
                        ? { ...m, text: response.text, isThinking: false, sources: response.sources }
                        : m
                ) 
              }
            : s
    ));

    setIsProcessing(false);
  };

  const renderWelcomeScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="mb-8 p-4 bg-card border border-border rounded-full shadow-sm text-primary">
                {mode === AppMode.INVESTOR ? (
                    <LineChart className="w-12 h-12" />
                ) : (
                    <ShieldCheck className="w-12 h-12" />
                )}
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-3">
                {mode === AppMode.INVESTOR ? 'Investor Research' : 'Company Audit'}
            </h1>
            
            <p className="text-muted-foreground max-w-lg text-center mb-10 text-lg">
                {mode === AppMode.INVESTOR 
                    ? "AI-powered due diligence. Research companies, analyze markets, and get grounded facts with source citations."
                    : "Official verification portal. Submit your company details for AI fact-checking and database entry."
                }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
                {mode === AppMode.INVESTOR ? (
                    <>
                        <button onClick={() => handleSendMessage("Analyze Google's market position in AI")} className="p-4 bg-card border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left shadow-sm">
                            <div className="font-semibold text-foreground mb-1">Analyze Google AI Strategy</div>
                            <div className="text-sm text-muted-foreground">Evaluate market risks and opportunities</div>
                        </button>
                        <button onClick={() => handleSendMessage("Find top Series A fintech companies in NY")} className="p-4 bg-card border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left shadow-sm">
                            <div className="font-semibold text-foreground mb-1">Scout Fintech Startups</div>
                            <div className="text-sm text-muted-foreground">Series A companies in New York</div>
                        </button>
                    </>
                ) : (
                     <>
                        <button onClick={() => handleSendMessage("I want to start an audit for my company.")} className="p-4 bg-card border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left shadow-sm">
                            <div className="font-semibold text-foreground mb-1">Start New Audit</div>
                            <div className="text-sm text-muted-foreground">Begin the interview and verification process</div>
                        </button>
                        <button onClick={() => handleSendMessage("Here are my Q3 financials: $2M revenue, 20% growth.")} className="p-4 bg-card border border-border rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left shadow-sm">
                            <div className="font-semibold text-foreground mb-1">Verify Financials</div>
                            <div className="text-sm text-muted-foreground">Cross-check revenue claims</div>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
        currentMode={mode}
        setMode={(m) => { setMode(m); setCurrentSessionId(null); }}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewSession}
        onSelectSession={setCurrentSessionId}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="h-full flex flex-col">
                {!currentSession || currentSession.messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center pb-20">
                        {renderWelcomeScreen()}
                    </div>
                ) : (
                    <div className="flex-1 pb-32">
                        {currentSession.messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
        </div>

        {/* Input Area - Floating at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-20 pb-8 px-4">
            <InputArea 
                onSend={handleSendMessage} 
                disabled={isProcessing}
                placeholder={mode === AppMode.INVESTOR ? "Ask TrustFundr to research a company..." : "Answer the auditor's questions..."}
            />
        </div>
      </main>
    </div>
  );
};

export default App;