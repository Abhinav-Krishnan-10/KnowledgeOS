import React from "react";
import { HelpCircle, ChevronRight, Award, GraduationCap, RefreshCw } from "lucide-react";
import { Document, Flashcard, QuizQuestion } from "../services/api";

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
              <div className="space-y-6 max-w-xl mx-auto text-center animate-float">
                {flashcards.length > 0 ? (
                  <div className="space-y-6">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                      Flashcard {currentCardIndex + 1} of {flashcards.length}
                    </span>

                    {/* Flip Card container */}
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="w-full aspect-[4/3] max-w-md mx-auto cursor-pointer relative perspective-1000 group"
                    >
                      <div className={`w-full h-full rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col items-center justify-center transition-all duration-500 transform-style-3d ${
                        isCardFlipped ? "bg-purple-950/20 text-purple-200" : "bg-zinc-900 text-zinc-100"
                      }`}>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-widest absolute top-4 block">
                          {isCardFlipped ? "Answer" : "Question"}
                        </span>

                        <p className="text-sm md:text-base font-bold leading-relaxed px-4">
                          {isCardFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                        </p>

                        <span className="text-[9px] text-zinc-500 absolute bottom-4 uppercase tracking-widest">
                          Click to flip card
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <button
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setCurrentCardIndex(prev => prev - 1);
                          setIsCardFlipped(false);
                        }}
                        className="px-4 py-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Prev Card
                      </button>
                      <button
                        disabled={currentCardIndex === flashcards.length - 1}
                        onClick={() => {
                          setCurrentCardIndex(prev => prev + 1);
                          setIsCardFlipped(false);
                        }}
                        className="px-4 py-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-12 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-500 text-xs">No active study deck created.</p>
                    <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Compile Study Deck</button>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ SECTION */}
            {activeLearningTab === "quiz" && (
              <div className="max-w-xl mx-auto space-y-6">
                {quizQuestions.length > 0 ? (
                  quizFinished ? (
                    <div className="glass-panel p-8 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                      <Award className="w-12 h-12 text-yellow-500 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">Assessment Finished</h4>
                        <p className="text-zinc-500 text-xs">You scored <strong className="text-pink-400">{quizScore} out of {quizQuestions.length}</strong> questions correct.</p>
                      </div>
                      <button 
                        onClick={triggerLearningGeneration}
                        className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Restart Assessment
                      </button>
                    </div>
                  ) : (
                    <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5 bg-zinc-900/30">
                      <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-white/5 pb-3">
                        <span className="font-mono">Assessment Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                        <span className="font-bold text-pink-400">Score: {quizScore}</span>
                      </div>

                      <p className="font-bold text-zinc-200 text-sm leading-relaxed">
                        {quizQuestions[currentQuizIndex].question}
                      </p>

                      <div className="space-y-2.5">
                        {quizQuestions[currentQuizIndex].options.map((opt, oidx) => {
                          const selected = selectedQuizOption === opt;
                          const isCorrect = opt === quizQuestions[currentQuizIndex].correct_answer;
                          return (
                            <button
                              key={oidx}
                              onClick={() => {
                                if (selectedQuizOption) return; // lock selection
                                setSelectedQuizOption(opt);
                                if (opt === quizQuestions[currentQuizIndex].correct_answer) {
                                  setQuizScore(prev => prev + 1);
                                }
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                selectedQuizOption 
                                  ? isCorrect 
                                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                                    : selected 
                                    ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                                    : "bg-zinc-950 border-white/5 text-zinc-500"
                                  : "bg-zinc-950 border-white/5 hover:border-pink-500/25 text-zinc-300 hover:bg-zinc-900/30"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {selectedQuizOption && (
                        <div className="pt-4 flex items-center justify-between border-t border-white/5">
                          <span className={`text-[10px] font-bold ${
                            selectedQuizOption === quizQuestions[currentQuizIndex].correct_answer 
                              ? "text-emerald-400" 
                              : "text-rose-400"
                          }`}>
                            {selectedQuizOption === quizQuestions[currentQuizIndex].correct_answer 
                              ? "✓ Correct Answer" 
                              : `✖ Incorrect (Correct: ${quizQuestions[currentQuizIndex].correct_answer})`}
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
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{currentQuizIndex === quizQuestions.length - 1 ? "Get Results" : "Next Question"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                    </div>
                  )
                ) : (
                  <div className="glass-panel p-12 text-center rounded-3xl space-y-4 border border-white/5 bg-zinc-900/30">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-500 text-xs">No active quiz compiled.</p>
                    <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Compile Quiz</button>
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

          </div>
        )}
      </div>
    </div>
  );
};
