import React from "react";
import { HelpCircle, ChevronRight, Award, GraduationCap, RefreshCw } from "lucide-react";
import { api, Document, Flashcard, QuizQuestion } from "../services/api";

interface LearningTabProps {
  learningDocId: number | null;
  setLearningDocId: (val: number | null) => void;
  activeLearningTab: "summary" | "flashcards" | "quiz" | "notes";
  setActiveLearningTab: (val: any) => void;
  isLearningLoading: boolean;
  summaryData: string | null;
  notesData: string | null;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  currentCardIndex: number;
  setCurrentCardIndex: (idx: number | ((prev: number) => number)) => void;
  isCardFlipped: boolean;
  setIsCardFlipped: (val: boolean) => void;
  currentQuizIndex: number;
  setCurrentQuizIndex: (idx: number | ((prev: number) => number)) => void;
  selectedQuizOption: string | null;
  setSelectedQuizOption: (val: string | null) => void;
  quizScore: number;
  setQuizScore: (val: number | ((prev: number) => number)) => void;
  quizFinished: boolean;
  setQuizFinished: (val: boolean) => void;
  triggerLearningGeneration: () => Promise<void>;
  documents: Document[];
}

export const LearningTab: React.FC<LearningTabProps> = ({
  learningDocId,
  setLearningDocId,
  activeLearningTab,
  setActiveLearningTab,
  isLearningLoading,
  summaryData,
  notesData,
  flashcards,
  quizQuestions,
  currentCardIndex,
  setCurrentCardIndex,
  isCardFlipped,
  setIsCardFlipped,
  currentQuizIndex,
  setCurrentQuizIndex,
  selectedQuizOption,
  setSelectedQuizOption,
  quizScore,
  setQuizScore,
  quizFinished,
  setQuizFinished,
  triggerLearningGeneration,
  documents
}) => {
  // Concept Explainer Local States
  const [conceptQuery, setConceptQuery] = React.useState("");
  const [conceptLevel, setConceptLevel] = React.useState<"simple" | "intermediate" | "advanced">("simple");
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningDocId) return;
    if (!conceptQuery.trim()) return;
    
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await api.generateExplanation(learningDocId, conceptQuery, conceptLevel);
      setExplanation(res.explanation);
    } catch {
      setExplanation("Failed to generate explanation. Please ensure the backend is online.");
    } finally {
      setIsExplaining(false);
    }
  };

  // Reset explanation when document changes
  React.useEffect(() => {
    setConceptQuery("");
    setExplanation(null);
  }, [learningDocId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Select Document panel */}
      <div className="lg:col-span-3 glass-panel p-5 rounded-3xl space-y-6 overflow-y-auto border border-white/5 bg-zinc-900/30">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-white">Study Deck</h3>
          <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-bold">Document Select</span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Reference Document</label>
          <select 
            value={learningDocId || ""}
            onChange={(e) => setLearningDocId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="" disabled>Select Document...</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl text-[10px] text-zinc-500 leading-normal space-y-1">
          <span className="font-mono text-zinc-400 font-bold block uppercase">Study Tools</span>
          <p>Choose between executive summaries, flip cards, interactive quizzes, or study notes.</p>
        </div>
      </div>

      {/* Core learning panel */}
      <div className="lg:col-span-9 space-y-6">
        {/* Learning tool selectors */}
        <div className="flex border-b border-white/5 text-xs font-semibold">
          {[
            { id: "summary", label: "Executive Summary" },
            { id: "flashcards", label: "Revision Flashcards" },
            { id: "quiz", label: "Comprehension Quiz" },
            { id: "notes", label: "Revision Notes" }
          ].map(lt => (
            <button
              key={lt.id}
              onClick={() => setActiveLearningTab(lt.id as any)}
              className={`px-4 py-3 border-b-2 transition-all cursor-pointer ${
                activeLearningTab === lt.id 
                  ? "border-pink-500 text-pink-400 font-bold" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {lt.label}
            </button>
          ))}
        </div>

        {/* Action Loader */}
        {isLearningLoading ? (
          <div className="glass-panel p-20 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
            <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
            <p className="text-zinc-500 text-xs">AI pipeline is parsing document chunks and synthesizing study materials...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* SUMMARY SECTION */}
            {activeLearningTab === "summary" && (
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                {summaryData ? (
                  <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none">
                    {summaryData}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-500 text-xs">No summary generated yet for this file.</p>
                    <button 
                      onClick={triggerLearningGeneration} 
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Compile Summary
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARDS SECTION */}
            {activeLearningTab === "flashcards" && (
              <div className="glass-panel p-8 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto text-pink-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="font-bold text-white text-base">Revision Flashcards Mode</h4>
                  <p className="text-zinc-400 text-xs leading-normal">
                    The interactive flashcards for this document have been loaded into the **Study Console** on the right side of your workspace. 
                    Flip them to verify your memory retention.
                  </p>
                </div>
                {flashcards.length === 0 ? (
                  <button 
                    onClick={triggerLearningGeneration}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Compile Flashcards
                  </button>
                ) : (
                  <div className="text-xs text-zinc-500 font-mono">
                    {flashcards.length} flashcards loaded in Study Console.
                  </div>
                )}
              </div>
            )}

            {/* QUIZ SECTION */}
            {activeLearningTab === "quiz" && (
              <div className="glass-panel p-8 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto text-pink-400">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="font-bold text-white text-base">Comprehension Assessment Quiz</h4>
                  <p className="text-zinc-400 text-xs leading-normal">
                    The multiple-choice assessment quiz for this document has been loaded into the **Study Console** on the right side of your workspace. 
                    Select options and grade your answers dynamically.
                  </p>
                </div>
                {quizQuestions.length === 0 ? (
                  <button 
                    onClick={triggerLearningGeneration}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Compile Assessment Quiz
                  </button>
                ) : (
                  <div className="text-xs text-zinc-500 font-mono">
                    {quizQuestions.length} multiple-choice questions loaded in Study Console.
                  </div>
                )}
              </div>
            )}

            {/* REVISION NOTES SECTION */}
            {activeLearningTab === "notes" && (
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                {notesData ? (
                  <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none">
                    {notesData}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-500 text-xs">No study cheat sheets created yet.</p>
                    <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Compile revision cheat sheet</button>
                  </div>
                )}
              </div>
            )}

            {/* CONCEPT EXPLAINER WIDGET */}
            {learningDocId && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/30 space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">AI Concept Explainer</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Explain conceptual ideas instantly</p>
                  </div>
                </div>

                <form onSubmit={handleExplain} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text"
                      required
                      value={conceptQuery}
                      onChange={(e) => setConceptQuery(e.target.value)}
                      placeholder="Enter a concept (e.g. 'Vector Embeddings')"
                      className="flex-1 bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-pink-500/50"
                    />
                    
                    <button
                      type="submit"
                      disabled={isExplaining || !conceptQuery.trim()}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      {isExplaining ? "Analyzing..." : "Explain"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Explanation Complexity level:</span>
                      <span className="text-pink-400 font-mono">{conceptLevel.toUpperCase()}</span>
                    </div>
                    
                    {/* Level Slider */}
                    <div className="flex items-center space-x-3 bg-zinc-950 p-2.5 rounded-xl border border-white/5">
                      {["simple", "intermediate", "advanced"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setConceptLevel(lvl as any)}
                          className={`flex-1 py-1 px-3 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                            conceptLevel === lvl 
                              ? "bg-pink-500/15 border border-pink-500/30 text-pink-300"
                              : "bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {lvl === "simple" && "Simple (5yo)"}
                          {lvl === "intermediate" && "Intermediate"}
                          {lvl === "advanced" && "Advanced"}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {explanation && (
                  <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl space-y-2 animate-float">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-widest block">AI Explanation Summary</span>
                    <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">{explanation}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
