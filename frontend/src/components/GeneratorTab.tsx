import React from "react";
import { FileEdit, RefreshCw } from "lucide-react";
import { Document } from "../services/api";

interface GeneratorTabProps {
  generatorType: "resume" | "project_description" | "report" | "portfolio";
  setGeneratorType: (val: "resume" | "project_description" | "report" | "portfolio") => void;
  generatorInstructions: string;
  setGeneratorInstructions: (val: string) => void;
  generatorDocs: number[];
  setGeneratorDocs: (val: number[] | ((prev: number[]) => number[])) => void;
  generatedOutput: string | null;
  isGenerating: boolean;
  handleGenerateContent: (e: React.FormEvent) => Promise<void>;
  documents: Document[];
  notify: (type: "success" | "error" | "info", msg: string) => void;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({
  generatorType,
  setGeneratorType,
  generatorInstructions,
  setGeneratorInstructions,
  generatorDocs,
  setGeneratorDocs,
  generatedOutput,
  isGenerating,
  handleGenerateContent,
  documents,
  notify
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Input requirements form */}
      <form onSubmit={handleGenerateContent} className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-5 border border-white/5 bg-zinc-900/30">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-white">Smart Document Synthesizer</h3>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Grounded Generation</span>
        </div>

        {/* Template selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Document Template</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "resume", label: "Professional Resume" },
              { id: "project_description", label: "Project Spec" },
              { id: "report", label: "Technical Report" },
              { id: "portfolio", label: "Portfolio Intro" }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setGeneratorType(t.id as any)}
                className={`p-3 border rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                  generatorType === t.id 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md" 
                    : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grounding documents filter checklists */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Ground in documents (check all that apply)</label>
          <div className="max-h-36 overflow-y-auto bg-zinc-950/60 border border-white/5 rounded-xl p-2.5 space-y-1.5">
            {documents.length === 0 ? (
              <span className="text-[10px] text-zinc-600 block italic">No files available to select</span>
            ) : (
              documents.map(d => {
                const checked = generatorDocs.includes(d.id);
                return (
                  <label key={d.id} className="flex items-center space-x-2 text-[10px] text-zinc-400 cursor-pointer hover:text-white">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setGeneratorDocs(prev => prev.filter(id => id !== d.id));
                        } else {
                          setGeneratorDocs(prev => [...prev, d.id]);
                        }
                      }}
                      className="rounded border-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="truncate">{d.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Injected instructions */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Generation Instructions</label>
          <textarea
            required
            rows={4}
            value={generatorInstructions}
            onChange={(e) => setGeneratorInstructions(e.target.value)}
            placeholder="E.g., 'Summarize my technical skill sets, emphasizing FastAPI and Docker Compose configurations.'"
            className="w-full bg-zinc-950 border border-white/5 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Document...</span>
              </>
            ) : (
              <>
                <FileEdit className="w-3.5 h-3.5" />
                <span>Synthesize Document</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Markdown Preview pane */}
      <div className="lg:col-span-7 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative min-h-[400px] border border-white/5 bg-zinc-900/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
        
        <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs bg-zinc-950/20">
          <span className="font-bold text-zinc-400 uppercase tracking-widest font-mono text-[10px]">Workspace Output Preview</span>
          <span className="text-[9px] bg-zinc-950 border border-white/5 px-2 py-0.5 rounded text-zinc-500">Grounded Markdown</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {generatedOutput ? (
            <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none font-sans leading-relaxed">
              {generatedOutput}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 py-20">
              <FileEdit className="w-8 h-8 text-zinc-700" />
              <p className="text-xs">Enter details and compile content to view the preview workspace here.</p>
            </div>
          )}
        </div>

        {generatedOutput && (
          <div className="p-4 border-t border-white/5 flex items-center justify-end bg-zinc-950/30">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedOutput);
                notify("success", "Markdown copy succeeded!");
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Copy Markdown Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
