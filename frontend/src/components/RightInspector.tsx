import React from "react";
import { BookOpen, GraduationCap, MessageSquare, Trash2, X, ChevronLeft, ChevronRight, Award, HelpCircle } from "lucide-react";
import { Category, Document, Flashcard, QuizQuestion } from "../services/api";

interface RightInspectorProps {
  activeDocDetail: Document | null;
  setActiveDocDetail: (doc: Document | null) => void;
  selectedCitation: {
    text: string;
    document_name: string;
    chunk_index: number;
    score?: number;
  } | null;
  setSelectedCitation: (cit: any | null) => void;
  activeTab: string;
  activeLearningTab: "summary" | "flashcards" | "quiz" | "notes";
  setActiveLearningTab: (val: any) => void;
  categories: Category[];
  setLearningDocId: (id: number | null) => void;
  setActiveTab: (tab: any) => void;
  handleDeleteDoc: (id: number) => void;
  setChatDocFilter: (id: number | null) => void;
  notify: (type: "success" | "error" | "info", msg: string) => void;

  // Flashcards state
  flashcards: Flashcard[];
  currentCardIndex: number;
  setCurrentCardIndex: (idx: number | ((prev: number) => number)) => void;
  isCardFlipped: boolean;
  setIsCardFlipped: (val: boolean) => void;

  // Quiz state
  quizQuestions: QuizQuestion[];
  currentQuizIndex: number;
  setCurrentQuizIndex: (idx: number | ((prev: number) => number)) => void;
  selectedQuizOption: string | null;
  setSelectedQuizOption: (val: string | null) => void;
  quizScore: number;
  setQuizScore: (val: number | ((prev: number) => number)) => void;
  quizFinished: boolean;
  setQuizFinished: (val: boolean) => void;

  // Trigger loading
  triggerLearningGeneration: () => Promise<void>;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  activeDocDetail,
  setActiveDocDetail,
  selectedCitation,
  setSelectedCitation,
  activeTab,
  activeLearningTab,
  setActiveLearningTab,
  categories,
  setLearningDocId,
  setActiveTab,
  handleDeleteDoc,
  setChatDocFilter,
  notify,
  flashcards,
  currentCardIndex,
  setCurrentCardIndex,
  isCardFlipped,
  setIsCardFlipped,
  quizQuestions,
  currentQuizIndex,
  setCurrentQuizIndex,
  selectedQuizOption,
  setSelectedQuizOption,
  quizScore,
  setQuizScore,
  quizFinished,
  setQuizFinished,
  triggerLearningGeneration
}) => {
  // Determine Right Inspector Mode
  let mode: "citation" | "flashcards" | "quiz" | "metadata" | null = null;
  
  if (selectedCitation) {
    mode = "citation";
  } else if (activeTab === "learning" && activeLearningTab === "flashcards") {
    mode = "flashcards";
  } else if (activeTab === "learning" && activeLearningTab === "quiz") {
    mode = "quiz";
  } else if (activeDocDetail) {
    mode = "metadata";
  }

  // Handle closing drawer
  const handleClose = () => {
    if (selectedCitation) {
      setSelectedCitation(null);
    } else if (activeTab === "learning" && activeLearningTab === "flashcards") {
      setActiveLearningTab("summary");
    } else if (activeTab === "learning" && activeLearningTab === "quiz") {
      setActiveLearningTab("summary");
    } else if (activeDocDetail) {
      setActiveDocDetail(null);
    }
  };

  // If no mode is active, display the desktop placeholder
  if (!mode) {
    return (
      <aside className="hidden lg:flex w-80 shrink-0 bg-zinc-950 border-l border-white/5 p-6 h-full overflow-y-auto flex-col items-center justify-center text-center text-zinc-600 space-y-3">
        <BookOpen className="w-8 h-8 text-zinc-700" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block font-mono">No Reference Focus</span>
          <p className="text-[10px] text-zinc-500 leading-normal max-w-[200px] mx-auto">
            Select a document in the vault tree, click a citation badge, or study via the Learning Hub to populate this console.
          </p>
        </div>
      </aside>
    );
  }

  // Render Citation Text Viewer (Mode A)
  const renderCitation = () => {
    if (!selectedCitation) return null;
    return (
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl space-y-3 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono font-bold uppercase">
              <span>Retrieval Reference</span>
              {selectedCitation.score !== undefined && (
                <span className="text-indigo-400">Match {(selectedCitation.score * 100).toFixed(1)}%</span>
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 font-mono block uppercase">Document Source</span>
              <span className="text-xs font-bold text-zinc-200 block truncate" title={selectedCitation.document_name}>
                {selectedCitation.document_name}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 font-mono block uppercase">Chunk Index</span>
              <span className="text-xs font-bold text-zinc-200 block">
                #chunk {selectedCitation.chunk_index}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col overflow-hidden">
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block font-bold shrink-0">Text Segment Block</span>
            <div className="flex-1 p-4 bg-zinc-950 border border-white/5 rounded-2xl text-[11px] text-zinc-300 leading-relaxed font-sans overflow-y-auto select-all">
              {selectedCitation.text}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 shrink-0">
          <button 
            onClick={() => {
              const matchedDoc = categories.length > 0 ? null : null; // Typecheck helper
              notify("info", "Closing inspector");
              handleClose();
            }}
            className="w-full py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-xs transition-colors"
          >
            Dismiss Inspector
          </button>
        </div>
      </div>
    );
  };

  // Render Flipping Flashcards Panel (Mode B)
  const renderFlashcards = () => {
    if (flashcards.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-500 space-y-4">
          <GraduationCap className="w-8 h-8 text-zinc-700 animate-pulse" />
          <p className="text-xs max-w-[200px]">No Flashcards compiled yet. Click 'Compile Flashcards' in the Learning Hub.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-center flex-1 flex flex-col justify-center">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            Card {currentCardIndex + 1} of {flashcards.length}
          </span>
        </div>

        {/* 3D Flip Card Container */}
        <div 
          onClick={() => setIsCardFlipped(!isCardFlipped)}
          className="w-full aspect-[4/3] max-w-sm mx-auto cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <div 
            className="relative w-full h-full transition-transform duration-500"
            style={{ 
              transformStyle: "preserve-3d", 
              transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {/* Front Face: Question */}
            <div 
              className="absolute inset-0 w-full h-full bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-[9px] uppercase font-bold text-pink-400 font-mono tracking-widest absolute top-4">
                Question
              </span>
              <p className="text-xs md:text-sm font-bold text-zinc-200 px-2 leading-relaxed">
                {flashcards[currentCardIndex].question}
              </p>
              <span className="text-[8px] text-zinc-500 font-mono absolute bottom-4 uppercase tracking-widest">
                Tap to Flip
              </span>
            </div>

            {/* Back Face: Answer */}
            <div 
              className="absolute inset-0 w-full h-full bg-pink-950/20 border border-pink-500/20 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <span className="text-[9px] uppercase font-bold text-pink-400 font-mono tracking-widest absolute top-4">
                Answer
              </span>
              <p className="text-xs md:text-sm font-semibold text-zinc-200 px-2 leading-relaxed">
                {flashcards[currentCardIndex].answer}
              </p>
              <span className="text-[8px] text-zinc-500 font-mono absolute bottom-4 uppercase tracking-widest">
                Tap to Flip
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center space-x-4">
          <button
            disabled={currentCardIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentCardIndex(prev => prev - 1);
              setIsCardFlipped(false);
            }}
            className="p-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentCardIndex === flashcards.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentCardIndex(prev => prev + 1);
              setIsCardFlipped(false);
            }}
            className="p-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render MCQ Quiz Solver (Mode C)
  const renderQuiz = () => {
    if (quizQuestions.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-500 space-y-4">
          <HelpCircle className="w-8 h-8 text-zinc-700 animate-pulse" />
          <p className="text-xs max-w-[200px]">No Quiz compiled yet. Click 'Compile Quiz' in the Learning Hub.</p>
        </div>
      );
    }

    if (quizFinished) {
      return (
        <div className="space-y-6 text-center py-10 flex-1 flex flex-col justify-center">
          <Award className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">Quiz Finished</h4>
            <p className="text-zinc-400 text-xs">
              Score: <strong className="text-pink-400">{quizScore} / {quizQuestions.length}</strong> correct
            </p>
          </div>
          <button 
            onClick={triggerLearningGeneration}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/10"
          >
            Restart Assessment
          </button>
        </div>
      );
    }

    const currentQuestion = quizQuestions[currentQuizIndex];
    return (
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/5 pb-2 font-mono">
            <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
            <span className="text-pink-400 font-bold">Score: {quizScore}</span>
          </div>

          <p className="font-bold text-zinc-200 text-xs leading-relaxed select-text">
            {currentQuestion.question}
          </p>

          <div className="space-y-2 select-none">
            {currentQuestion.options.map((opt, oidx) => {
              const selected = selectedQuizOption === opt;
              const isCorrect = opt === currentQuestion.correct_answer;
              return (
                <button
                  key={oidx}
                  disabled={selectedQuizOption !== null}
                  onClick={() => {
                    setSelectedQuizOption(opt);
                    if (opt === currentQuestion.correct_answer) {
                      setQuizScore(prev => prev + 1);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedQuizOption 
                      ? isCorrect 
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : selected 
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                        : "bg-zinc-950 border-white/5 text-zinc-600"
                      : "bg-zinc-950 border-white/5 hover:border-pink-500/25 text-zinc-300 hover:bg-zinc-900/30"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {selectedQuizOption && (
          <div className="pt-4 border-t border-white/5 flex flex-col space-y-2.5">
            <span className={`text-[10px] font-bold text-center ${
              selectedQuizOption === currentQuestion.correct_answer 
                ? "text-emerald-400" 
                : "text-rose-400"
            }`}>
              {selectedQuizOption === currentQuestion.correct_answer 
                ? "✓ Correct Answer" 
                : `✖ Incorrect (Correct: ${currentQuestion.correct_answer})`}
            </span>

            <button
              onClick={() => {
                if (currentQuizIndex === quizQuestions.length - 1) {
                  setQuizFinished(true);
                } else {
                  setCurrentQuizIndex(prev => prev + 1);
                  setSelectedQuizOption(null);
                }
              }}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{currentQuizIndex === quizQuestions.length - 1 ? "Get Results" : "Next Question"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Metadata Panel (Default)
  const renderMetadata = () => {
    if (!activeDocDetail) return null;
    const fileExtension = activeDocDetail.name.substring(activeDocDetail.name.lastIndexOf(".") + 1).toUpperCase();
    return (
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-full aspect-video bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-indigo-500/20 text-indigo-300 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
              {fileExtension}
            </div>
            <BookOpen className="w-10 h-10 text-indigo-500/30" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Name</span>
              <span className="text-zinc-200 font-semibold truncate block select-all" title={activeDocDetail.name}>
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
                <span className="text-zinc-200 font-semibold truncate block">
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
                <span className={`text-[10px] font-bold font-mono ${activeDocDetail.status === "indexed" ? "text-emerald-400" : "text-indigo-400 animate-pulse"}`}>
                  {activeDocDetail.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-2 mt-6">
          <button 
            onClick={() => {
              setLearningDocId(activeDocDetail.id);
              setActiveTab("learning");
              setActiveLearningTab("summary");
              handleClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Run Learning Assistant</span>
          </button>
          
          <button 
            onClick={() => {
              setChatDocFilter(activeDocDetail.id);
              setActiveTab("chat");
              notify("info", `Grounded Chat session on "${activeDocDetail.name}"`);
              handleClose();
            }}
            className="w-full py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat With This Document</span>
          </button>
          
          <button 
            onClick={() => {
              handleDeleteDoc(activeDocDetail.id);
              handleClose();
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Document</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className="fixed inset-0 z-50 bg-zinc-950 p-6 flex flex-col justify-between overflow-y-auto w-full h-full 
                      lg:static lg:z-auto lg:w-80 lg:shrink-0 lg:border-t-0 lg:border-l lg:border-white/5 lg:flex">
      
      {/* Header section with Dynamic Title and Close X Button */}
      <div className="flex items-start justify-between border-b border-white/5 pb-4 shrink-0">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-white">
            {mode === "metadata" && "Metadata Panel"}
            {mode === "citation" && "Citation details"}
            {mode === "flashcards" && "Revision Flashcards"}
            {mode === "quiz" && "Comprehension Quiz"}
          </h3>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">
            {mode === "metadata" && "Reference Details"}
            {mode === "citation" && "Search Match"}
            {mode === "flashcards" && "Study Console"}
            {mode === "quiz" && "Study Console"}
          </span>
        </div>
        <button 
          onClick={handleClose}
          className="text-zinc-500 hover:text-white p-1.5 bg-zinc-900 border border-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Mode Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden mt-6">
        {mode === "metadata" && renderMetadata()}
        {mode === "citation" && renderCitation()}
        {mode === "flashcards" && renderFlashcards()}
        {mode === "quiz" && renderQuiz()}
      </div>

    </aside>
  );
};
