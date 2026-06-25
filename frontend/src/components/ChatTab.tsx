import React from "react";
import { Send } from "lucide-react";
import { Category, Document } from "../services/api";

interface ChatTabProps {
  chatMessages: Array<{ sender: "user" | "ai"; text: string; citations?: any[]; time: string }>;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleChatSubmit: (e?: React.FormEvent, customQuery?: string) => Promise<void>;
  isChatTyping: boolean;
  chatDocFilter: number | null;
  setChatDocFilter: (val: number | null) => void;
  chatCatFilter: number | null;
  setChatCatFilter: (val: number | null) => void;
  documents: Document[];
  categories: Category[];
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  suggestedPrompts: string[];
}

export const ChatTab: React.FC<ChatTabProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  isChatTyping,
  chatDocFilter,
  setChatDocFilter,
  chatCatFilter,
  setChatCatFilter,
  documents,
  categories,
  chatBottomRef,
  suggestedPrompts
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-230px)] min-h-[500px] max-w-5xl mx-auto">
      {/* Sidebar configurations */}
      <div className="lg:col-span-3 glass-panel p-5 rounded-3xl flex flex-col justify-between overflow-y-auto space-y-6 border border-white/5 bg-zinc-900/30">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white">Chat Session</h3>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">RAG Parameters</span>
          </div>

          {/* Grounding File selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Grounded Document</label>
            <select 
              value={chatDocFilter || ""}
              onChange={(e) => setChatDocFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">Query Entire Vault</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Grounding Category selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Grounded Topic Category</label>
            <select 
              value={chatCatFilter || ""}
              onChange={(e) => setChatCatFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Topics</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick instructions indicator */}
        <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1.5">
          <span className="text-[9px] uppercase font-bold text-zinc-500 block font-mono">Reference Engine</span>
          <p className="text-[10px] text-zinc-500 leading-normal">Answers are augmented using vector similarity. Footnotes display the cited files.</p>
        </div>
      </div>

      {/* Conversation Core panel */}
      <div className="lg:col-span-9 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative border border-white/5 bg-zinc-900/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
        
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((msg, idx) => {
            const isAi = msg.sender === "ai";
            return (
              <div key={idx} className={`flex items-start space-x-3 ${isAi ? "" : "justify-end"}`}>
                {isAi && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-[10px] text-white shrink-0 shadow-lg shadow-purple-500/10">
                    AI
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl max-w-[85%] space-y-2 border ${
                  isAi 
                    ? "bg-zinc-950/60 border-white/5 text-zinc-200" 
                    : "bg-purple-600 text-white border-transparent"
                }`}>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  
                  {/* Display Citations if present */}
                  {isAi && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mr-1">Sources:</span>
                      {msg.citations.map((cit, cidx) => (
                        <span 
                          key={cidx} 
                          className="text-[9px] bg-zinc-950 border border-white/5 text-zinc-400 px-2 py-0.5 rounded flex items-center space-x-1"
                          title={cit.text}
                        >
                          <span>{cit.document_name}</span>
                          <span className="text-[8px] text-purple-400">#chunk {cit.chunk_index}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <span className={`text-[8px] font-mono block text-right ${isAi ? "text-zinc-600" : "text-purple-300"}`}>
                    {msg.time}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                    Us
                  </div>
                )}
              </div>
            );
          })}

          {isChatTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-[10px] text-white shrink-0 animate-pulse">
                AI
              </div>
              <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl text-zinc-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
              </div>
            </div>
          )}
          
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion buttons */}
        {chatMessages.length === 1 && (
          <div className="px-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((p, pidx) => (
              <button
                key={pidx}
                onClick={() => handleChatSubmit(undefined, p)}
                className="text-left p-2.5 bg-zinc-950/40 hover:bg-zinc-950 border border-white/5 hover:border-purple-500/20 text-[10px] text-zinc-400 hover:text-purple-300 rounded-xl transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleChatSubmit} className="p-4 bg-zinc-950 border-t border-white/5 flex items-center space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question about your knowledge files..."
            className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-500/15 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
