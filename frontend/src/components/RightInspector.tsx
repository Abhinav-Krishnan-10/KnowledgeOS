import React from "react";
import { BookOpen, GraduationCap, MessageSquare, Trash2 } from "lucide-react";
import { Category, Document } from "../services/api";

interface RightInspectorProps {
  activeDocDetail: Document | null;
  setActiveDocDetail: (doc: Document | null) => void;
  categories: Category[];
  setLearningDocId: (id: number | null) => void;
  setActiveTab: (tab: any) => void;
  handleDeleteDoc: (id: number) => void;
  setChatDocFilter: (id: number | null) => void;
  notify: (type: "success" | "error" | "info", msg: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  activeDocDetail,
  setActiveDocDetail,
  categories,
  setLearningDocId,
  setActiveTab,
  handleDeleteDoc,
  setChatDocFilter,
  notify
}) => {
  if (!activeDocDetail) {
    return (
      <aside className="hidden lg:block w-80 shrink-0 bg-zinc-950 border-l border-white/5 p-6 h-full overflow-y-auto">
        <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3">
          <BookOpen className="w-8 h-8 text-zinc-700" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block font-mono">No Reference Focus</span>
            <p className="text-[10px] text-zinc-500 leading-normal max-w-[200px] mx-auto">Select a document in the vault tree or overview card to view metadata and trigger study workflows.</p>
          </div>
        </div>
      </aside>
    );
  }

  const fileExtension = activeDocDetail.name.substring(activeDocDetail.name.lastIndexOf(".") + 1).toUpperCase();

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/5 p-6 h-full overflow-y-auto flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white">Metadata Panel</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Reference Details</span>
          </div>
          <button 
            onClick={() => setActiveDocDetail(null)}
            className="text-zinc-500 hover:text-white text-[10px] px-2 py-1 bg-zinc-900 border border-white/5 rounded"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="w-full aspect-video bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
              {fileExtension}
            </div>
            <BookOpen className="w-10 h-10 text-purple-500/30" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Name</span>
              <span className="text-zinc-200 font-semibold truncate block" title={activeDocDetail.name}>
                {activeDocDetail.name}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Size</span>
                <span className="text-zinc-200 font-semibold">{(activeDocDetail.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Topic</span>
                <span className="text-zinc-200 font-semibold">
                  {categories.find(c => c.id === activeDocDetail.category_id)?.name || 'General'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Created at</span>
                <span className="text-zinc-200 font-semibold">{new Date(activeDocDetail.created_at).toLocaleDateString()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Embed status</span>
                <span className={`text-[10px] font-bold font-mono ${activeDocDetail.status === "indexed" ? "text-emerald-400" : "text-purple-400 animate-pulse"}`}>
                  {activeDocDetail.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 space-y-2 mt-6">
        <button 
          onClick={() => {
            setLearningDocId(activeDocDetail.id);
            setActiveTab("learning");
          }}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors flex items-center justify-center space-x-1.5"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Run Learning Assistant</span>
        </button>
        
        <button 
          onClick={() => {
            setChatDocFilter(activeDocDetail.id);
            setActiveTab("chat");
            notify("info", `Grounded Chat session on "${activeDocDetail.name}"`);
          }}
          className="w-full py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat With This Document</span>
        </button>
        
        <button 
          onClick={() => handleDeleteDoc(activeDocDetail.id)}
          className="w-full py-2.5 bg-zinc-900 hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove Document</span>
        </button>
      </div>
    </aside>
  );
};
