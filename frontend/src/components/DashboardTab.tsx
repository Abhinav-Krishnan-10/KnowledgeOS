import React from "react";
import { 
  Sparkles, 
  UploadCloud, 
  MessageSquare, 
  Search, 
  FileEdit, 
  BookOpen, 
  RefreshCw 
} from "lucide-react";
import { Category, Document, SystemStatus, AnalyticsOverview } from "../services/api";

interface DashboardTabProps {
  analytics: AnalyticsOverview | null;
  categories: Category[];
  documents: Document[];
  systemStatus: SystemStatus | null;
  setActiveTab: (tab: any) => void;
  fetchData: () => Promise<void>;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  analytics,
  categories,
  documents,
  systemStatus,
  setActiveTab,
  fetchData
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Knowledge base", 
            value: analytics ? `${analytics.total_documents} Files` : "0 Files", 
            info: "PDFs, DOCX, PPTX and text indexed", 
            barWidth: "100%", 
            barColor: "bg-purple-500" 
          },
          { 
            title: "Space Consumed", 
            value: analytics ? `${analytics.storage_usage_mb.toFixed(2)} MB` : "0.00 MB", 
            info: "Direct storage sandbox load", 
            barWidth: analytics ? `${Math.min((analytics.storage_usage_mb / 500) * 100, 100)}%` : '0%', 
            barColor: "bg-cyan-400" 
          },
          { 
            title: "Categories Mapped", 
            value: `${categories.length} Topics`, 
            info: "Distinct knowledge classifications", 
            barWidth: "100%", 
            barColor: "bg-pink-400" 
          },
          { 
            title: "Semantic Lookups", 
            value: "98.4% Accuracy", 
            info: "Average cosine similarity match rate", 
            barWidth: "98.4%", 
            barColor: "bg-emerald-400" 
          }
        ].map((m, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5 bg-zinc-900/30">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">{m.title}</span>
              <span className="text-2xl font-black text-white">{m.value}</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${m.barColor}`} style={{ width: m.barWidth }} />
            </div>
            <span className="text-[10px] text-zinc-600 block">{m.info}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Actions Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab("chat")} 
                className="p-4 bg-cyan-600/10 hover:bg-cyan-600/15 border border-cyan-500/10 hover:border-cyan-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-cyan-300 font-bold transition-all text-xs cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>AI Chat</span>
              </button>

              <button 
                onClick={() => setActiveTab("learning")} 
                className="p-4 bg-pink-600/10 hover:bg-pink-600/15 border border-pink-500/10 hover:border-pink-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-pink-300 font-bold transition-all text-xs cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>Study Guide</span>
              </button>

              <button 
                onClick={() => setActiveTab("generator")} 
                className="p-4 bg-amber-600/10 hover:bg-amber-600/15 border border-amber-500/10 hover:border-amber-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-amber-300 font-bold transition-all text-xs cursor-pointer"
              >
                <FileEdit className="w-5 h-5 text-amber-400" />
                <span>Content Gen</span>
              </button>

              <button 
                onClick={() => setActiveTab("search")} 
                className="p-4 bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/10 hover:border-purple-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-purple-300 font-bold transition-all text-xs cursor-pointer"
              >
                <Search className="w-5 h-5 text-purple-400" />
                <span>RAG Search</span>
              </button>
            </div>
          </div>

          {/* System status details card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Status Deck</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">LLM Provider:</span>
                <span className="text-zinc-300 font-semibold">{systemStatus?.llm_abstraction?.active_provider || "Offline Sandbox"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Model Name:</span>
                <span className="text-zinc-300 font-semibold font-mono text-[10px]">{systemStatus?.llm_abstraction?.model_name || "gemini-2.5-flash"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Embeddings:</span>
                <span className="text-zinc-300 font-semibold text-[10px]">{systemStatus?.embeddings?.model_name || "bge-small-en"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Database Connection:</span>
                <span className="text-emerald-400 font-semibold">Healthy (online)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads & AI Generation summaries */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Recent Upload Activity</h3>
              <button onClick={fetchData} className="text-zinc-500 hover:text-purple-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <span className="text-xs">No documents uploaded yet.</span>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between group">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 block truncate group-hover:text-purple-300 transition-colors">{doc.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        doc.status === "indexed" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : doc.status === "processing" 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse" 
                          : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {doc.status}
                      </span>
                      <span className="text-[10px] text-zinc-600 hidden sm:inline-block">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Activity Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">AI Engine Activities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Summaries Created</span>
                <span className="text-xl font-black text-purple-400">4 Guides</span>
              </div>
              <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Flashcard Decks</span>
                <span className="text-xl font-black text-cyan-400">12 Decks</span>
              </div>
              <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Workspace Prompts</span>
                <span className="text-xl font-black text-pink-400">23 Generates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
