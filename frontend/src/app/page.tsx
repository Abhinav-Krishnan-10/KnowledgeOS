"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu,
  CheckCircle2, 
  AlertCircle, 
  Info,
  RefreshCw,
  Cpu,
  Search,
  Sparkles,
  BookOpen
} from "lucide-react";

import { 
  api, 
  Category, 
  Document, 
  SearchResult, 
  Flashcard, 
  QuizQuestion,
  SystemStatus,
  AnalyticsOverview
} from "../services/api";

import { LeftSidebar } from "../components/LeftSidebar";
import { RightInspector } from "../components/RightInspector";
import { DashboardTab } from "../components/DashboardTab";
import { ChatTab } from "../components/ChatTab";
import { LearningTab } from "../components/LearningTab";
import { GeneratorTab } from "../components/GeneratorTab";

type TabType = "dashboard" | "chat" | "learning" | "generator" | "search" | "settings";

export default function Home() {
  // Navigation & Shell Layout States
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Workspace States
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: number; type: "success" | "error" | "info"; message: string }>>([]);
  const [activeDocDetail, setActiveDocDetail] = useState<Document | null>(null);

  // Upload Center States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'indexed' | 'failed'>('idle');
  const [uploadCategory, setUploadCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [searchDocQuery, setSearchDocQuery] = useState("");

  // AI Assistant Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; citations?: any[]; time: string }>>([
    { 
      sender: "ai", 
      text: "Hello! I am your KnowledgeOS assistant. Ask me questions and I will answer them grounded strictly in your vault archives.", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [chatDocFilter, setChatDocFilter] = useState<number | null>(null);
  const [chatCatFilter, setChatCatFilter] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [suggestedPrompts] = useState([
    "Explain the RAG embedding dimension details",
    "What are the projected revenues for FY2026?",
    "Summarize Abhinav's software skills from his resume",
    "How does semantic vector search solve keyword gaps?"
  ]);

  // Semantic Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLimit, setSearchLimit] = useState(5);
  const [searchDocFilter, setSearchDocFilter] = useState<number | null>(null);
  const [searchCatFilter, setSearchCatFilter] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Learning Assistant States
  const [learningDocId, setLearningDocId] = useState<number | null>(null);
  const [activeLearningTab, setActiveLearningTab] = useState<"summary" | "flashcards" | "quiz" | "notes">("summary");
  const [summaryData, setSummaryData] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLearningLoading, setIsLearningLoading] = useState(false);

  // Content Generator States
  const [generatorType, setGeneratorType] = useState<"resume" | "project_description" | "report" | "portfolio">("resume");
  const [generatorInstructions, setGeneratorInstructions] = useState("");
  const [generatorDocs, setGeneratorDocs] = useState<number[]>([]);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Configuration States
  const [activeLLMProvider, setActiveLLMProvider] = useState("gemini");
  const [customApiKey, setCustomApiKey] = useState("");

  interface SelectedCitation {
    text: string;
    document_name: string;
    chunk_index: number;
    score?: number;
  }

  // Citation Inspector State
  const [selectedCitation, setSelectedCitation] = useState<SelectedCitation | null>(null);

  // Toast Helper
  const notify = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Fetch Workspace Data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [docs, cats, stats, anls] = await Promise.all([
        api.listDocuments(),
        api.listCategories(),
        api.getStatus(),
        api.getAnalytics()
      ]);
      
      setDocuments(docs);
      setCategories(cats);
      setSystemStatus(stats);
      setAnalytics(anls);
      
      if (docs.length > 0 && !learningDocId) {
        setLearningDocId(docs[0].id);
      }
    } catch (err) {
      notify("error", "Failed fetching initial server details. Operating on mock engine.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll processing files and analytics updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const needsPolling = documents.some(d => d.status === "uploaded" || d.status === "processing");
      if (needsPolling || activeTab === "dashboard") {
        try {
          const freshDocs = await api.listDocuments();
          setDocuments(freshDocs);
          const freshAnls = await api.getAnalytics();
          setAnalytics(freshAnls);
        } catch {
          // Ignore background polling errors
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [documents, activeTab]);

  // Scroll Chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatTyping]);

  // Trigger Study Generation when parameters change
  useEffect(() => {
    if (learningDocId && activeTab === "learning") {
      triggerLearningGeneration();
    }
  }, [learningDocId, activeLearningTab, activeTab]);

  // Event Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await api.createCategory(newCategoryName, newCategoryDesc);
      setCategories(prev => [...prev, newCat]);
      setNewCategoryName("");
      setNewCategoryDesc("");
      setIsCreatingCategory(false);
      notify("success", `Category "${newCat.name}" created successfully.`);
    } catch {
      notify("error", "Failed to create category.");
    }
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this document and its embeddings?")) return;
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocDetail && activeDocDetail.id === id) setActiveDocDetail(null);
      notify("success", "Document removed successfully from database.");
      const freshAnls = await api.getAnalytics();
      setAnalytics(freshAnls);
    } catch {
      notify("error", "Error removing document.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    const allowed = [".pdf", ".docx", ".pptx", ".txt", ".png", ".jpg", ".jpeg", ".bmp"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      notify("error", `Unsupported format. Supported: ${allowed.join(", ")}`);
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadProgress(15);
      
      const progInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 85) {
            clearInterval(progInterval);
            return 85;
          }
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 300);

      await api.uploadDocument(file, uploadCategory || undefined);
      
      clearInterval(progInterval);
      setUploadProgress(100);
      setUploadStatus("processing");
      
      notify("success", `"${file.name}" uploaded successfully. Indexing started.`);
      
      const freshDocs = await api.listDocuments();
      setDocuments(freshDocs);

      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(null);
      }, 2000);
    } catch (err) {
      setUploadStatus("failed");
      notify("error", "Failed uploading document.");
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(null);
      }, 3000);
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuery || chatInput;
    if (!queryText.trim() || isChatTyping) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: "user", text: queryText, time: formattedTime }]);
    if (!customQuery) setChatInput("");
    setIsChatTyping(true);

    try {
      const response = await api.chat(
        queryText,
        5,
        chatDocFilter || undefined,
        chatCatFilter || undefined
      );

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: "ai",
          text: response.answer,
          citations: response.retrieved_context,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsChatTyping(false);
      }, 1000);
    } catch {
      setIsChatTyping(false);
      notify("error", "AI service error.");
    }
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchPerformed(true);

    try {
      const response = await api.search(
        searchQuery,
        searchLimit,
        searchDocFilter || undefined,
        searchCatFilter || undefined
      );
      setSearchResults(response.results);
    } catch {
      notify("error", "Search pipeline error.");
    } finally {
      setIsSearching(false);
    }
  };

  const triggerLearningGeneration = async () => {
    if (!learningDocId) {
      notify("info", "Please select a document to study.");
      return;
    }
    setIsLearningLoading(true);
    try {
      if (activeLearningTab === "summary") {
        const res = await api.generateSummary(learningDocId);
        setSummaryData(res.summary);
      } else if (activeLearningTab === "flashcards") {
        const res = await api.generateFlashcards(learningDocId, 6);
        setFlashcards(res.flashcards);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
      } else if (activeLearningTab === "quiz") {
        const res = await api.generateQuiz(learningDocId, 5);
        setQuizQuestions(res.quiz);
        setCurrentQuizIndex(0);
        setSelectedQuizOption(null);
        setQuizScore(0);
        setQuizFinished(false);
      } else if (activeLearningTab === "notes") {
        const res = await api.generateNotes(learningDocId);
        setNotesData(res.notes);
      }
    } catch {
      notify("error", "Failed compiling study items.");
    } finally {
      setIsLearningLoading(false);
    }
  };

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorInstructions.trim()) {
      notify("info", "Instructions cannot be empty.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.generateContent(
        generatorType,
        generatorInstructions,
        generatorDocs.length > 0 ? generatorDocs : undefined
      );
      setGeneratedOutput(res.content);
      notify("success", `${generatorType.replace("_", " ")} compiled successfully.`);
    } catch {
      notify("error", "Content generator error.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col md:flex-row relative">
      
      {/* Custom Toast Stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-xl border shadow-xl flex items-start space-x-3 pointer-events-auto backdrop-blur-md transition-all duration-300 animate-float ${
              n.type === "success" 
                ? "bg-emerald-950/70 border-emerald-500/20 text-emerald-200" 
                : n.type === "error" 
                ? "bg-rose-950/70 border-rose-500/20 text-rose-200" 
                : "bg-zinc-900/80 border-white/5 text-zinc-200"
            }`}
          >
            {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {n.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {n.type === "info" && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span className="text-xs font-semibold leading-normal">{n.message}</span>
          </div>
        ))}
      </div>

      {/* MOBILE HEADER */}
      <header className="md:hidden glass-panel border-b border-white/5 w-full px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">KnowledgeOS</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* SIDEBAR NAVIGATION SHELL */}
      <LeftSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        categories={categories}
        documents={documents}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        isCreatingCategory={isCreatingCategory}
        setIsCreatingCategory={setIsCreatingCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryDesc={newCategoryDesc}
        setNewCategoryDesc={setNewCategoryDesc}
        handleCreateCategory={handleCreateCategory}
        handleFileSelect={handleFileSelect}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        fileInputRef={fileInputRef}
        handleDeleteDoc={handleDeleteDoc}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        searchDocQuery={searchDocQuery}
        setSearchDocQuery={setSearchDocQuery}
        activeDocDetail={activeDocDetail}
        setActiveDocDetail={setActiveDocDetail}
        analytics={analytics}
      />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 h-screen">
        {/* TOP STATUS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">KnowledgeOS Workspace</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>
                {activeTab === "dashboard" && "Workspace Dashboard"}
                {activeTab === "chat" && "AI Assistant Chat"}
                {activeTab === "learning" && "Learning Assistant"}
                {activeTab === "generator" && "Personalized Content"}
                {activeTab === "search" && "Semantic Similarity Search"}
                {activeTab === "settings" && "System Settings"}
              </span>
              {activeTab === "dashboard" && <Sparkles className="w-5 h-5 text-purple-400 glow-text-primary" />}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-zinc-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-zinc-400">
              <span className="font-bold text-zinc-500 font-mono">LLM Provider:</span>
              <span className="text-zinc-300 font-semibold">{systemStatus?.llm_abstraction?.active_provider || "gemini (simulated)"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            </div>

            <button 
              onClick={fetchData}
              className="p-2.5 bg-zinc-900 border border-white/5 hover:border-purple-500/20 rounded-xl text-zinc-400 hover:text-purple-400 transition-colors cursor-pointer"
              title="Sync Workspace"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Center Pane Swapper with smooth Framer Motion Transitions */}
        <div className="flex-1 min-h-[500px]">
          {isLoading && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-zinc-500 text-xs font-semibold">Initializing workspace configurations...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                {/* 1. Dashboard tab */}
                {activeTab === "dashboard" && (
                  <DashboardTab
                    analytics={analytics}
                    categories={categories}
                    documents={documents}
                    systemStatus={systemStatus}
                    setActiveTab={setActiveTab}
                    fetchData={fetchData}
                  />
                )}

                {/* 2. AI chat tab */}
                {activeTab === "chat" && (
                  <ChatTab
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    handleChatSubmit={handleChatSubmit}
                    isChatTyping={isChatTyping}
                    chatDocFilter={chatDocFilter}
                    setChatDocFilter={setChatDocFilter}
                    chatCatFilter={chatCatFilter}
                    setChatCatFilter={setChatCatFilter}
                    documents={documents}
                    categories={categories}
                    chatBottomRef={chatBottomRef}
                    suggestedPrompts={suggestedPrompts}
                    setSelectedCitation={setSelectedCitation}
                  />
                )}

                {/* 3. Learning Suite tab */}
                {activeTab === "learning" && (
                  <LearningTab
                    learningDocId={learningDocId}
                    setLearningDocId={setLearningDocId}
                    activeLearningTab={activeLearningTab}
                    setActiveLearningTab={setActiveLearningTab}
                    isLearningLoading={isLearningLoading}
                    summaryData={summaryData}
                    notesData={notesData}
                    flashcards={flashcards}
                    quizQuestions={quizQuestions}
                    currentCardIndex={currentCardIndex}
                    setCurrentCardIndex={setCurrentCardIndex}
                    isCardFlipped={isCardFlipped}
                    setIsCardFlipped={setIsCardFlipped}
                    currentQuizIndex={currentQuizIndex}
                    setCurrentQuizIndex={setCurrentQuizIndex}
                    selectedQuizOption={selectedQuizOption}
                    setSelectedQuizOption={setSelectedQuizOption}
                    quizScore={quizScore}
                    setQuizScore={setQuizScore}
                    quizFinished={quizFinished}
                    setQuizFinished={setQuizFinished}
                    triggerLearningGeneration={triggerLearningGeneration}
                    documents={documents}
                  />
                )}

                {/* 4. RAG Synthesizer Content Generator tab */}
                {activeTab === "generator" && (
                  <GeneratorTab
                    generatorType={generatorType}
                    setGeneratorType={setGeneratorType}
                    generatorInstructions={generatorInstructions}
                    setGeneratorInstructions={setGeneratorInstructions}
                    generatorDocs={generatorDocs}
                    setGeneratorDocs={setGeneratorDocs}
                    generatedOutput={generatedOutput}
                    isGenerating={isGenerating}
                    handleGenerateContent={handleGenerateContent}
                    documents={documents}
                    notify={notify}
                  />
                )}

                {/* 5. Semantic Search tab */}
                {activeTab === "search" && (
                  <div className="space-y-8 max-w-5xl mx-auto">
                    <form onSubmit={handleSemanticSearch} className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5 bg-zinc-900/30">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-white">Semantic Similarity Search</h3>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">pgvector Index Lookup</span>
                      </div>

                      <div className="relative">
                        <input 
                          type="text"
                          required
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ask or search conceptual topics (e.g. 'projected CAGR revenues')"
                          className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-4 pl-12 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-3.5" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-1 sm:col-span-3">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Filter by Category (Checkmarks)</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(c => {
                              const isChecked = searchCatFilter === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setSearchCatFilter(isChecked ? null : c.id)}
                                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                    isChecked 
                                      ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                                      : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                    isChecked ? "bg-cyan-500 border-transparent text-black font-extrabold" : "border-zinc-700"
                                  }`}>
                                    {isChecked && "✓"}
                                  </span>
                                  <span>{c.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2 col-span-1 sm:col-span-3">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Filter by Document (Checkmarks)</label>
                          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1.5 bg-zinc-950/40 rounded-xl border border-white/5">
                            {documents.map(d => {
                              const isChecked = searchDocFilter === d.id;
                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => setSearchDocFilter(isChecked ? null : d.id)}
                                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                    isChecked 
                                      ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                                      : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                    isChecked ? "bg-cyan-500 border-transparent text-black font-extrabold" : "border-zinc-700"
                                  }`}>
                                    {isChecked && "✓"}
                                  </span>
                                  <span className="truncate max-w-[150px]">{d.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Max Matches</label>
                          <select 
                            value={searchLimit}
                            onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                          >
                            <option value={3}>Top 3</option>
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSearching}
                          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          {isSearching ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Retrieving chunks...</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              <span>Execute Query</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {searchPerformed && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">
                          Search Results ({searchResults.length} chunks retrieved)
                        </span>

                        {searchResults.length === 0 ? (
                          <div className="glass-panel p-12 text-center text-zinc-500 text-xs border border-white/5 bg-zinc-900/30">
                            No relevant text segments matched the query. Try adjusting thresholds or upload more reference files.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {searchResults.map((res, i) => (
                              <div 
                                key={i} 
                                onClick={() => setSelectedCitation({
                                  text: res.text,
                                  document_name: res.document_name,
                                  chunk_index: res.chunk_index,
                                  score: res.similarity_score
                                })}
                                className="glass-panel p-5 rounded-2xl border border-white/5 bg-zinc-900/30 space-y-3 relative overflow-hidden hover:border-cyan-500/30 cursor-pointer transition-all duration-200 animate-float"
                              >
                                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                                  <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4 text-cyan-400" />
                                    <span className="font-bold text-zinc-200">{res.document_name}</span>
                                    <span className="text-[9px] bg-zinc-950 border border-white/5 text-zinc-500 px-1.5 py-0.2 rounded font-mono">
                                      #chunk {res.chunk_index}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-zinc-400">Match score:</span>
                                    <span className="font-bold text-cyan-400 font-mono">{(res.similarity_score * 100).toFixed(1)}%</span>
                                  </div>
                                </div>
                                <p className="text-zinc-300 text-xs leading-relaxed font-sans">{res.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Settings tab */}
                {activeTab === "settings" && (
                  <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5 bg-zinc-900/30">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-white">System Configurations</h3>
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">LLM Switching</span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Active LLM Model Target</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: "gemini", label: "Google Gemini 2.5 Flash", note: "Fast, balanced cost" },
                              { id: "openai", label: "OpenAI GPT-4o", note: "Highly technical outputs" },
                              { id: "ollama", label: "Ollama (Offline Local)", note: "Secure, 100% private" }
                            ].map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setActiveLLMProvider(p.id);
                                  notify("info", `Switched active provider to ${p.id.toUpperCase()}`);
                                }}
                                className={`p-4 border rounded-2xl text-left transition-all cursor-pointer ${
                                  activeLLMProvider === p.id 
                                    ? "bg-purple-600/10 border-purple-500/30 text-purple-300" 
                                    : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <span className="text-xs font-bold block">{p.label}</span>
                                <span className="text-[9px] text-zinc-500 block mt-1">{p.note}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {activeLLMProvider !== "ollama" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                              Custom API Access Key (Optional)
                            </label>
                            <input 
                              type="password"
                              value={customApiKey}
                              onChange={(e) => setCustomApiKey(e.target.value)}
                              placeholder={`Enter custom ${activeLLMProvider.toUpperCase()} key to override server credentials`}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500/50"
                            />
                            <span className="text-[9px] text-zinc-600 block">Overrides active default credential keys set inside server `.env` files.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* RIGHT REFERENCE INSPECTOR */}
      <RightInspector
        activeDocDetail={activeDocDetail}
        setActiveDocDetail={setActiveDocDetail}
        selectedCitation={selectedCitation}
        setSelectedCitation={setSelectedCitation}
        activeTab={activeTab}
        activeLearningTab={activeLearningTab}
        setActiveLearningTab={setActiveLearningTab}
        categories={categories}
        setLearningDocId={setLearningDocId}
        setActiveTab={setActiveTab as any}
        handleDeleteDoc={handleDeleteDoc}
        setChatDocFilter={setChatDocFilter}
        notify={notify}
        flashcards={flashcards}
        currentCardIndex={currentCardIndex}
        setCurrentCardIndex={setCurrentCardIndex}
        isCardFlipped={isCardFlipped}
        setIsCardFlipped={setIsCardFlipped}
        quizQuestions={quizQuestions}
        currentQuizIndex={currentQuizIndex}
        setCurrentQuizIndex={setCurrentQuizIndex}
        selectedQuizOption={selectedQuizOption}
        setSelectedQuizOption={setSelectedQuizOption}
        quizScore={quizScore}
        setQuizScore={setQuizScore}
        quizFinished={quizFinished}
        setQuizFinished={setQuizFinished}
        triggerLearningGeneration={triggerLearningGeneration}
      />
    </div>
  );
}
