import React from "react";
import { 
  Cpu, 
  LayoutDashboard, 
  MessageSquare, 
  GraduationCap, 
  FileEdit, 
  Search, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  UploadCloud, 
  FolderPlus, 
  Trash2, 
  HardDrive
} from "lucide-react";
import { Category, Document } from "../services/api";

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  categories: Category[];
  documents: Document[];
  uploadProgress: number | null;
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'indexed' | 'failed';
  uploadCategory: number | null;
  setUploadCategory: (catId: number | null) => void;
  isCreatingCategory: boolean;
  setIsCreatingCategory: (creating: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryDesc: string;
  setNewCategoryDesc: (desc: string) => void;
  handleCreateCategory: (e: React.FormEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDeleteDoc: (id: number) => void;
  selectedCategoryFilter: number | null;
  setSelectedCategoryFilter: (catId: number | null) => void;
  searchDocQuery: string;
  setSearchDocQuery: (q: string) => void;
  activeDocDetail: Document | null;
  setActiveDocDetail: (doc: Document | null) => void;
  analytics: any;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  categories,
  documents,
  uploadProgress,
  uploadStatus,
  uploadCategory,
  setUploadCategory,
  isCreatingCategory,
  setIsCreatingCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryDesc,
  setNewCategoryDesc,
  handleCreateCategory,
  handleFileSelect,
  handleDragOver,
  handleDrop,
  fileInputRef,
  handleDeleteDoc,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  searchDocQuery,
  setSearchDocQuery,
  activeDocDetail,
  setActiveDocDetail,
  analytics
}) => {
  return (
    <aside 
      className={`${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 fixed md:static inset-y-0 left-0 z-45 w-64 shrink-0 bg-zinc-950 border-r border-white/5 flex flex-col justify-between h-full`}
    >
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Logo Frame */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white">KnowledgeOS</span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Workspace v1.0</span>
            </div>
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block p-1 bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 rounded text-zinc-500 hover:text-purple-400 transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Switcher */}
        <nav className="p-4 space-y-1">
          {[
            { id: "dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
            { id: "chat", icon: <MessageSquare className="w-4 h-4" />, label: "AI Assistant Chat" },
            { id: "learning", icon: <GraduationCap className="w-4 h-4" />, label: "Learning Assistant" },
            { id: "generator", icon: <FileEdit className="w-4 h-4" />, label: "Personalized Content" },
            { id: "search", icon: <Search className="w-4 h-4" />, label: "Semantic Search" },
            { id: "settings", icon: <Settings2 className="w-4 h-4" />, label: "Settings" }
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active 
                    ? "bg-purple-600/10 text-purple-400 border border-purple-500/15" 
                    : "text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
                title={item.label}
              >
                <div className={`${active ? "text-purple-400 scale-115" : "text-zinc-500"} transition-all shrink-0`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Drag & Drop Vault */}
        <div className="p-4 border-t border-white/5 space-y-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono block">Drag-and-Drop Ingest</span>
          
          <div className="space-y-2">
            <select 
              value={uploadCategory || ""}
              onChange={(e) => setUploadCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-zinc-900 border border-white/5 rounded-lg py-1.5 px-2.5 text-[10px] text-zinc-400 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">No Topic (General)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              uploadStatus === "uploading" 
                ? "border-purple-500/50 bg-purple-950/5" 
                : "border-white/5 hover:border-purple-500/20 bg-zinc-950/20 hover:bg-zinc-900/10"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.bmp"
            />
            <UploadCloud className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <h4 className="text-[10px] font-bold text-zinc-300">Upload Files</h4>
            <p className="text-[8px] text-zinc-500 mt-0.5">Drag-drop PDFs/text</p>
          </div>

          {/* Progress Indicator */}
          {uploadProgress !== null && (
            <div className="bg-zinc-900/50 border border-white/5 p-2.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-semibold">
                <span className="text-zinc-400 truncate max-w-[80%]">
                  {uploadStatus === "uploading" && "Uploading..."}
                  {uploadStatus === "processing" && "AI processing..."}
                  {uploadStatus === "indexed" && "✓ Indexed!"}
                  {uploadStatus === "failed" && "✖ Failed"}
                </span>
                <span className="text-purple-400 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Document Explorer (Categorized folders tree list) */}
        <div className="p-4 border-t border-white/5 flex-1">
          <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono block mb-2">Vault Explorer</span>
          
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {/* Filter controls */}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-between ${
                  selectedCategoryFilter === null 
                    ? "bg-purple-600/10 text-purple-400 border border-purple-500/10" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                }`}
              >
                <span>All Documents</span>
                <span className="bg-zinc-900 px-1.5 py-0.2 rounded text-[8px] text-zinc-400">{documents.length}</span>
              </button>
              
              {categories.map(cat => {
                const count = documents.filter(d => d.category_id === cat.id).length;
                const active = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-between ${
                      active 
                        ? "bg-purple-600/10 text-purple-400 border border-purple-500/10" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="bg-zinc-900 px-1.5 py-0.2 rounded text-[8px] text-zinc-400">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Tree File List */}
            <div className="space-y-1 border-l border-white/5 pl-2 mt-2">
              {documents
                .filter(d => selectedCategoryFilter === null ? true : d.category_id === selectedCategoryFilter)
                .slice(0, 8)
                .map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => setActiveDocDetail(doc)}
                    className={`group/item flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      activeDocDetail?.id === doc.id ? "bg-purple-950/10 text-purple-300" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <BookOpen className={`w-3 h-3 shrink-0 ${doc.status === 'indexed' ? 'text-emerald-400' : 'text-purple-400'}`} />
                      <span className="text-[10px] truncate leading-none" title={doc.name}>{doc.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(doc.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              {documents.filter(d => selectedCategoryFilter === null ? true : d.category_id === selectedCategoryFilter).length > 8 && (
                <span className="text-[8px] text-zinc-600 block pl-1.5 italic">and more...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Status info */}
      <div className="p-4 m-4 border border-white/5 bg-zinc-950 rounded-xl space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center"><HardDrive className="w-3 h-3 mr-1" /> Storage</span>
          <span>{analytics ? `${analytics.storage_usage_mb} MB` : "Checking..."}</span>
        </div>
        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-500" 
            style={{ width: analytics ? `${Math.min((analytics.storage_usage_mb / 500) * 100, 100)}%` : '0%' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600">Engine status</span>
          <span className="flex items-center text-[9px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
