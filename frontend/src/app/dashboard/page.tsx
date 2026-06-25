"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Cpu, 
  LayoutDashboard, 
  Library, 
  UploadCloud, 
  MessageSquare, 
  Search, 
  GraduationCap, 
  FileEdit, 
  BarChart3, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  CheckCircle2, 
  AlertCircle, 
  FolderPlus,
  Trash2,
  Filter,
  Grid,
  List,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  HardDrive,
  User,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Send,
  HelpCircle,
  Award,
  BookOpen
} from "lucide-react";
import { 
  api, 
  Category, 
  Document, 
  SearchResult, 
  ChatResponse, 
  Flashcard, 
  QuizQuestion,
  SystemStatus,
  AnalyticsOverview
} from "../../services/api";

type TabType = 
  | "overview" 
  | "documents" 
  | "upload" 
  | "chat" 
  | "search" 
  | "learning" 
  | "generator" 
  | "analytics" 
  | "settings";

export default function Dashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: number; type: "success" | "error" | "info"; message: string }>>([]);

  // Filter & View states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [searchDocQuery, setSearchDocQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [activeDocDetail, setActiveDocDetail] = useState<Document | null>(null);

  // Upload Experience States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'indexed' | 'failed'>('idle');
  const [uploadCategory, setUploadCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; citations?: any[]; time: string }>>([
    { 
      sender: "ai", 
      text: "Hello! I am your KnowledgeOS assistant. I can scan your documents, extract insights, and answer questions grounded strictly in your personal archives. Select a document or ask me a general question below.", 
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
  
  // Learning Output States
  const [summaryData, setSummaryData] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Interactive study states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLearningLoading, setIsLearningLoading] = useState(false);
  const [explanationConcept, setExplanationConcept] = useState("");
  const [explanationLevel, setExplanationLevel] = useState("simple");
  const [explanationResult, setExplanationResult] = useState<string | null>(null);

  // Content Generator States
  const [generatorType, setGeneratorType] = useState<"resume" | "project_description" | "report" | "portfolio">("resume");
  const [generatorInstructions, setGeneratorInstructions] = useState("");
  const [generatorDocs, setGeneratorDocs] = useState<number[]>([]);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Profile/Settings States
  const [activeLLMProvider, setActiveLLMProvider] = useState("gemini");
  const [customApiKey, setCustomApiKey] = useState("");

  // Notify Helper
  const notify = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Fetch initial workspace data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const docs = await api.listDocuments();
      const cats = await api.listCategories();
      const stats = await api.getStatus();
      const anls = await api.getAnalytics();
      
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

  // Poll processing files every 4 seconds to simulate active indexing update
  useEffect(() => {
    const interval = setInterval(async () => {
      const needsPolling = documents.some(d => d.status === "uploaded" || d.status === "processing");
      if (needsPolling) {
        try {
          const freshDocs = await api.listDocuments();
          setDocuments(freshDocs);
          
          // Trigger refresh of analytics to update sizes
          const freshAnls = await api.getAnalytics();
          setAnalytics(freshAnls);
        } catch {
          // ignore background check errors
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [documents]);

  // Scroll chat window to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatTyping]);

  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------

  // Category Creation
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

  // Document Deletion
  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this document and its embeddings?")) return;
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocDetail && activeDocDetail.id === id) setActiveDocDetail(null);
      notify("success", "Document removed successfully from database.");
      // Refresh statistics
      const freshAnls = await api.getAnalytics();
      setAnalytics(freshAnls);
    } catch {
      notify("error", "Error removing document.");
    }
  };

  // Document Upload
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
    // Basic type validation
    const allowed = [".pdf", ".docx", ".pptx", ".txt", ".png", ".jpg", ".jpeg", ".bmp"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      notify("error", `Unsupported file format. Supported: ${allowed.join(", ")}`);
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadProgress(15);
      
      // Simulate fake progress bar during transmission
      const progInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 85) {
            clearInterval(progInterval);
            return 85;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);

      const res = await api.uploadDocument(file, uploadCategory || undefined);
      
      clearInterval(progInterval);
      setUploadProgress(100);
      setUploadStatus("processing");
      
      notify("success", `"${file.name}" uploaded successfully. Indexing started.`);
      
      // Refresh layout files
      const freshDocs = await api.listDocuments();
      setDocuments(freshDocs);

      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(null);
      }, 2000);
    } catch (err) {
      setUploadStatus("failed");
      notify("error", "Failed uploading document to the backend.");
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(null);
      }, 3000);
    }
  };

  // Conversational Chat Submit
  const handleChatSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuery || chatInput;
    if (!queryText.trim() || isChatTyping) return;

    // Add user message
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

      // Add AI Response with simulated typing delay for organic premium look
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
      notify("error", "AI service encountered an issue compiling a response.");
    }
  };

  // Semantic Search Submit
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

  // Study Tools API Generators
  const triggerLearningGeneration = async () => {
    if (!learningDocId) {
      notify("info", "Please select or upload a document to analyze first.");
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
      notify("error", "Failed compiling study items for this document.");
    } finally {
      setIsLearningLoading(false);
    }
  };

  // Trigger content generation
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

  // Run initial study query when document changes
  useEffect(() => {
    if (learningDocId && activeTab === "learning") {
      triggerLearningGeneration();
    }
  }, [learningDocId, activeLearningTab, activeTab]);

  // Clean document text query filters
  const filteredDocuments = documents.filter(d => {
    const matchesCat = selectedCategoryFilter ? d.category_id === selectedCategoryFilter : true;
    const matchesSearch = d.name.toLowerCase().includes(searchDocQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col md:flex-row relative">
      
      {/* Toast Notification Deck */}
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
      <header className="md:hidden glass-panel border-b border-white/5 w-full px-6 py-4 flex items-center justify-between sticky top-0 z-40">
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

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 fixed md:static inset-y-0 left-0 z-45 w-64 md:w-auto shrink-0 bg-zinc-950 border-r border-white/5 flex flex-col justify-between`}
      >
        <div className="flex flex-col">
          {/* Logo Frame */}
          <div className={`p-6 border-b border-white/5 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center space-x-2.5">
              <Link href="/" className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </Link>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-white">KnowledgeOS</span>
                  <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Workspace v1.0</span>
                </div>
              )}
            </div>
            
            {/* Collapse Toggle */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-1 bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 rounded text-zinc-500 hover:text-purple-400 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {[
              { id: "overview", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
              { id: "documents", icon: <Library className="w-4 h-4" />, label: "Document Library" },
              { id: "upload", icon: <UploadCloud className="w-4 h-4" />, label: "Upload Center" },
              { id: "chat", icon: <MessageSquare className="w-4 h-4" />, label: "AI Chat Hub" },
              { id: "search", icon: <Search className="w-4 h-4" />, label: "Semantic Search" },
              { id: "learning", icon: <GraduationCap className="w-4 h-4" />, label: "Learning Assistant" },
              { id: "generator", icon: <FileEdit className="w-4 h-4" />, label: "Content Generator" },
              { id: "analytics", icon: <BarChart3 className="w-4 h-4" />, label: "Analytics Overview" },
              { id: "settings", icon: <Settings2 className="w-4 h-4" />, label: "Settings" }
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active 
                      ? "bg-purple-600/10 text-purple-400 border border-purple-500/15" 
                      : "text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-900/50"
                  }`}
                  title={item.label}
                >
                  <div className={`${active ? "text-purple-400 scale-115 glow-text-primary" : "text-zinc-500"} transition-all shrink-0`}>
                    {item.icon}
                  </div>
                  {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsed System status badge */}
        {(!sidebarCollapsed || mobileMenuOpen) && (
          <div className="p-4 m-4 border border-white/5 bg-zinc-950 rounded-xl space-y-2">
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
        )}
      </aside>

      {/* MAIN SCREEN WORKSPACE CONTAINER */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8">
        
        {/* TOP STATUS CONTROL BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">KnowledgeOS System</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("_", " ")}</span>
              {activeTab === "overview" && <Sparkles className="w-5 h-5 text-purple-400 glow-text-primary" />}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-zinc-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-zinc-400">
              <span className="font-bold text-zinc-500 font-mono">API:</span>
              <span className="text-zinc-300 font-semibold">{systemStatus?.llm_abstraction.active_provider || "offline fallback"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            </div>

            <button 
              onClick={fetchData}
              className="p-2.5 bg-zinc-900 border border-white/5 hover:border-purple-500/20 rounded-xl text-zinc-400 hover:text-purple-400 transition-colors"
              title="Sync Workspace"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            TAB 1: OVERVIEW DASHBOARD
            ---------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8">
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
                  value: analytics ? `${analytics.storage_usage_mb} MB` : "0.0 MB", 
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
                <div key={idx} className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">{m.title}</span>
                    <span className="text-2xl font-black text-white">{m.value}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
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
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Quick Actions</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActiveTab("upload")} 
                      className="p-4 bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/10 hover:border-purple-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-purple-300 font-bold transition-all text-xs"
                    >
                      <UploadCloud className="w-5 h-5 text-purple-400" />
                      <span>Upload Files</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("chat")} 
                      className="p-4 bg-cyan-600/10 hover:bg-cyan-600/15 border border-cyan-500/10 hover:border-cyan-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-cyan-300 font-bold transition-all text-xs"
                    >
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <span>AI Chat Hub</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("search")} 
                      className="p-4 bg-pink-600/10 hover:bg-pink-600/15 border border-pink-500/10 hover:border-pink-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-pink-300 font-bold transition-all text-xs"
                    >
                      <Search className="w-5 h-5 text-pink-400" />
                      <span>Search Library</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("generator")} 
                      className="p-4 bg-amber-600/10 hover:bg-amber-600/15 border border-amber-500/10 hover:border-amber-500/25 rounded-2xl flex flex-col items-center justify-center space-y-2 text-amber-300 font-bold transition-all text-xs"
                    >
                      <FileEdit className="w-5 h-5 text-amber-400" />
                      <span>Write Document</span>
                    </button>
                  </div>
                </div>

                {/* System status details card */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Status Deck</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">LLM Provider:</span>
                      <span className="text-zinc-300 font-semibold">{systemStatus?.llm_abstraction.active_provider || "Offline Sandbox"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Model Name:</span>
                      <span className="text-zinc-300 font-semibold font-mono text-[10px]">{systemStatus?.llm_abstraction.model_name || "gemini-2.5-flash"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Embeddings:</span>
                      <span className="text-zinc-300 font-semibold text-[10px]">{systemStatus?.embeddings.model_name || "bge-small-en"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Database connection:</span>
                      <span className="text-emerald-400 font-semibold">Healthy (online)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Uploads & AI Generation summaries */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Recent Upload Activity</h3>
                  
                  {documents.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <span className="text-xs">No documents uploaded. Click Quick Actions to start.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {documents.slice(0, 4).map((doc) => (
                        <div key={doc.id} className="py-3 flex items-center justify-between group">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
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

                {/* AI Activity / category breakdown visual card */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">AI Engine Activities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Summaries Created</span>
                      <span className="text-xl font-black text-purple-400">4 Guides</span>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Flashcard Decks</span>
                      <span className="text-xl font-black text-cyan-400">12 Decks</span>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Workspace Prompts</span>
                      <span className="text-xl font-black text-pink-400">23 Generates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 2: DOCUMENT LIBRARY
            ---------------------------------------------------- */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            
            {/* Filter Deck */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCategoryFilter === null 
                      ? "bg-purple-600/10 border-purple-500/30 text-purple-400" 
                      : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Topics
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCategoryFilter === cat.id 
                        ? "bg-purple-600/10 border-purple-500/30 text-purple-400" 
                        : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchDocQuery}
                    onChange={(e) => setSearchDocQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:border-purple-500/50"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-1 flex items-center space-x-1">
                  <button 
                    onClick={() => setIsGridView(true)}
                    className={`p-1.5 rounded-lg ${isGridView ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsGridView(false)}
                    className={`p-1.5 rounded-lg ${!isGridView ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Lists splits */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Document Display Panel */}
              <div className={activeDocDetail ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
                
                {filteredDocuments.length === 0 ? (
                  <div className="glass-panel p-16 text-center rounded-3xl space-y-4">
                    <UploadCloud className="w-12 h-12 text-zinc-700 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">No Matching Files</h4>
                      <p className="text-zinc-500 text-xs max-w-sm mx-auto">We couldn't find any documents matching the select filters. Create a new category or upload files.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("upload")}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-500 transition-colors inline-flex items-center space-x-1.5"
                    >
                      <span>Ingest New File</span>
                    </button>
                  </div>
                ) : isGridView ? (
                  
                  // GRID VIEW
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => setActiveDocDetail(doc)}
                        className={`glass-panel p-5 rounded-2xl space-y-4 cursor-pointer border transition-all hover:border-purple-500/20 hover:shadow-lg ${
                          activeDocDetail?.id === doc.id ? "border-purple-500/30 bg-purple-950/5" : "border-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${
                            doc.status === "indexed" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : doc.status === "processing" 
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-zinc-100 text-xs truncate" title={doc.name}>{doc.name}</h4>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span>{(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                            <span className="font-mono text-[9px] uppercase">{categories.find(c => c.id === doc.category_id)?.name || 'General'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  
                  // LIST VIEW
                  <div className="glass-panel rounded-2xl divide-y divide-white/5 overflow-hidden">
                    {filteredDocuments.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => setActiveDocDetail(doc)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-zinc-900/40 ${
                          activeDocDetail?.id === doc.id ? "bg-purple-950/10" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-200 truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 shrink-0">
                          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline-block">{(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                          <span className="text-[10px] text-zinc-400 uppercase hidden sm:inline-block bg-zinc-900 px-2 py-0.5 border border-white/5 rounded">
                            {categories.find(c => c.id === doc.category_id)?.name || 'General'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            doc.status === "indexed" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document details sidebar */}
              {activeDocDetail && (
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-panel p-6 rounded-3xl space-y-6 sticky top-28">
                    <div className="flex items-start justify-between border-b border-white/5 pb-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-white">Metadata Panel</h3>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Reference Details</span>
                      </div>
                      <button 
                        onClick={() => setActiveDocDetail(null)}
                        className="text-zinc-500 hover:text-white text-xs px-2 py-1 bg-zinc-900 border border-white/5 rounded"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="w-full aspect-video bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-1 right-1 bg-purple-500/20 text-purple-300 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                          {activeDocDetail.name.substring(activeDocDetail.name.lastIndexOf(".") + 1)}
                        </div>
                        <BookOpen className="w-10 h-10 text-purple-500/30" />
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Name</span>
                          <span className="text-zinc-200 font-semibold truncate block" title={activeDocDetail.name}>{activeDocDetail.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Size</span>
                            <span className="text-zinc-200 font-semibold">{(activeDocDetail.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Topic</span>
                            <span className="text-zinc-200 font-semibold">{categories.find(c => c.id === activeDocDetail.category_id)?.name || 'General'}</span>
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

                    <div className="pt-4 border-t border-white/5 space-y-2">
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

                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 3: UPLOAD CENTER
            ---------------------------------------------------- */}
        {activeTab === "upload" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white">Ingestion Module</h3>
                <p className="text-zinc-500 text-xs">Upload raw files to map them inside your vector space. Supported extensions: PDF, DOCX, PPTX, TXT, and scanned image logs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Target Topic Category</label>
                  <select 
                    value={uploadCategory || ""}
                    onChange={(e) => setUploadCategory(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-4 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">No Topic (General)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Trigger Category Creator Modal inline */}
                <div className="flex items-end">
                  <button 
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="w-full py-3 bg-zinc-900 border border-white/5 hover:border-purple-500/25 text-zinc-400 hover:text-purple-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{isCreatingCategory ? "Cancel Category Form" : "Create New Topic Category"}</span>
                  </button>
                </div>
              </div>

              {isCreatingCategory && (
                <form onSubmit={handleCreateCategory} className="p-4 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block font-mono">New Category Setup</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category Name (e.g., Marketing)"
                      className="bg-zinc-900 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <input 
                      type="text"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      placeholder="Brief Description"
                      className="bg-zinc-900 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Save Category
                  </button>
                </form>
              )}

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
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
                
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <UploadCloud className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs">Drag & Drop Files Here</h4>
                    <p className="text-zinc-500 text-[10px]">Or click to browse storage files from your computer</p>
                  </div>
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {uploadProgress !== null && (
                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-300 flex items-center">
                      {uploadStatus === "uploading" && "Uploading document to folder..."}
                      {uploadStatus === "processing" && "AI Ingest pipeline processing (OCR & Chunking)..."}
                      {uploadStatus === "indexed" && "✓ Completed Vector indexing!"}
                      {uploadStatus === "failed" && "✖ Ingestion failed."}
                    </span>
                    <span className="text-purple-400 font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* List of uploaded files history */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">Upload History</span>
              {documents.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">No uploads detected in database.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {documents.map((d, i) => (
                    <div key={d.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-zinc-200 block truncate max-w-sm sm:max-w-md">{d.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase">
                            {categories.find(c => c.id === d.category_id)?.name || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === "indexed" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : d.status === "processing" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {d.status}
                        </span>
                        <button 
                          onClick={() => handleDeleteDoc(d.id)}
                          className="p-1 bg-zinc-900 border border-white/5 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 4: AI CHAT ASSISTANT
            ---------------------------------------------------- */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-230px)] min-h-[500px]">
            
            {/* Sidebar scope configurations */}
            <div className="lg:col-span-3 glass-panel p-5 rounded-3xl flex flex-col justify-between overflow-y-auto space-y-6">
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
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
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
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">All Topics</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick instructions indicator */}
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block font-mono">Reference Engine</span>
                <p className="text-[10px] text-zinc-500 leading-normal">Answers are augmented using vector similarity. Footnotes display the cited files.</p>
              </div>
            </div>

            {/* Conversation Core panel */}
            <div className="lg:col-span-9 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative">
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
                          ? "bg-zinc-900/60 border-white/5 text-zinc-200" 
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
                    <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl text-zinc-400 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 typing-dot" />
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
                      className="text-left p-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/20 text-[10px] text-zinc-400 hover:text-purple-300 rounded-xl transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleChatSubmit} className="p-4 bg-zinc-950/80 border-t border-white/5 flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your knowledge files..."
                  className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="submit"
                  className="p-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-500/15 transition-all glow-btn shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 5: SEMANTIC SEARCH
            ---------------------------------------------------- */}
        {activeTab === "search" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            
            {/* Control Panel */}
            <form onSubmit={handleSemanticSearch} className="glass-panel p-6 rounded-3xl space-y-6">
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
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 px-4 pl-12 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-3.5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Scope Document</label>
                  <select 
                    value={searchDocFilter || ""}
                    onChange={(e) => setSearchDocFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Query Entire Vault</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Scope Topic</label>
                  <select 
                    value={searchCatFilter || ""}
                    onChange={(e) => setSearchCatFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Topics</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Max Matches</label>
                  <select 
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50"
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
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 transition-all flex items-center space-x-2"
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

            {/* Results Deck */}
            {searchPerformed && (
              <div className="space-y-4 animate-float">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">
                  Search Results ({searchResults.length} chunks retrieved)
                </span>

                {searchResults.length === 0 ? (
                  <div className="glass-panel p-12 text-center text-zinc-500 text-xs">
                    No relevant text segments matched the query. Try adjusting thresholds or upload more reference files.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((res, i) => (
                      <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                        
                        {/* Similarity Score bar */}
                        <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-zinc-200">{res.document_name}</span>
                            <span className="text-[9px] bg-zinc-900 border border-white/5 text-zinc-500 px-1.5 py-0.2 rounded font-mono">
                              #chunk {res.chunk_index}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-zinc-400">Match score:</span>
                            <span className="font-bold text-cyan-400 font-mono">{(res.similarity_score * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Chunk Content */}
                        <p className="text-zinc-300 text-xs leading-relaxed font-sans">{res.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 6: LEARNING ASSISTANT
            ---------------------------------------------------- */}
        {activeTab === "learning" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Select Document panel */}
            <div className="lg:col-span-3 glass-panel p-5 rounded-3xl space-y-6 overflow-y-auto">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white">Study Deck</h3>
                <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest font-bold">Document Select</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Reference Document</label>
                <select 
                  value={learningDocId || ""}
                  onChange={(e) => setLearningDocId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="" disabled>Select Document...</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-[10px] text-zinc-500 leading-normal space-y-1">
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
                    className={`px-4 py-3 border-b-2 transition-all ${
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
                <div className="glass-panel p-20 text-center rounded-3xl space-y-4">
                  <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                  <p className="text-zinc-500 text-xs">AI pipeline is parsing document chunks and synthesizing study materials...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* SUMMARY SECTION */}
                  {activeLearningTab === "summary" && (
                    <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5">
                      {summaryData ? (
                        <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none">
                          {summaryData}
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-2">
                          <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-zinc-500 text-xs">No summary generated yet for this file.</p>
                          <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all">Compile Summary</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FLASHCARDS SECTION */}
                  {activeLearningTab === "flashcards" && (
                    <div className="space-y-6 max-w-xl mx-auto text-center">
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
                              className="px-4 py-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Prev Card
                            </button>
                            <button
                              disabled={currentCardIndex === flashcards.length - 1}
                              onClick={() => {
                                setCurrentCardIndex(prev => prev + 1);
                                setIsCardFlipped(false);
                              }}
                              className="px-4 py-2 bg-zinc-900 border border-white/5 hover:border-pink-500/20 text-zinc-400 hover:text-pink-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Next Card
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="glass-panel p-12 text-center rounded-3xl space-y-4">
                          <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-zinc-500 text-xs">No active study deck created.</p>
                          <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all">Compile Study Deck</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUIZ SECTION */}
                  {activeLearningTab === "quiz" && (
                    <div className="max-w-xl mx-auto space-y-6">
                      {quizQuestions.length > 0 ? (
                        quizFinished ? (
                          <div className="glass-panel p-8 text-center rounded-3xl space-y-4 border border-white/5">
                            <Award className="w-12 h-12 text-yellow-500 mx-auto" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-white text-base">Assessment Finished</h4>
                              <p className="text-zinc-500 text-xs">You scored **{quizScore} out of {quizQuestions.length}** questions correct.</p>
                            </div>
                            <button 
                              onClick={triggerLearningGeneration}
                              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Restart Assessment
                            </button>
                          </div>
                        ) : (
                          <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/5">
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
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                                      selectedQuizOption 
                                        ? isCorrect 
                                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                                          : selected 
                                          ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                                          : "bg-zinc-900 border-white/5 text-zinc-500"
                                        : "bg-zinc-900 border-white/5 hover:border-pink-500/25 text-zinc-300 hover:bg-zinc-900/60"
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
                                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                                >
                                  <span>{currentQuizIndex === quizQuestions.length - 1 ? "Get Results" : "Next Question"}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                          </div>
                        )
                      ) : (
                        <div className="glass-panel p-12 text-center rounded-3xl space-y-4">
                          <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-zinc-500 text-xs">No active quiz compiled.</p>
                          <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all">Compile Quiz</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REVISION NOTES SECTION */}
                  {activeLearningTab === "notes" && (
                    <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5">
                      {notesData ? (
                        <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none">
                          {notesData}
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-2">
                          <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-zinc-500 text-xs">No study cheat sheets created yet.</p>
                          <button onClick={triggerLearningGeneration} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all">Compile revision cheat sheet</button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 7: CONTENT GENERATOR
            ---------------------------------------------------- */}
        {activeTab === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input requirements form */}
            <form onSubmit={handleGenerateContent} className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-5">
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
                      className={`p-3 border rounded-xl text-[10px] font-bold text-center transition-all ${
                        generatorType === t.id 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md" 
                          : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
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
                <div className="max-h-36 overflow-y-auto bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 space-y-1.5">
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
                            className="rounded border-zinc-800 text-amber-500 focus:ring-0"
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
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-1.5"
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
            <div className="lg:col-span-7 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
              
              <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs bg-zinc-900/20">
                <span className="font-bold text-zinc-400 uppercase tracking-widest font-mono text-[10px]">Workspace Output Preview</span>
                <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-500">Grounded Markdown</span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {generatedOutput ? (
                  <div className="prose prose-invert text-xs text-zinc-300 space-y-4 whitespace-pre-wrap max-w-none font-sans">
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
                <div className="p-4 border-t border-white/5 flex items-center justify-end bg-zinc-900/30">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedOutput);
                      notify("success", "Markdown copy succeeded!");
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl font-bold text-xs transition-colors"
                  >
                    Copy Markdown Code
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 8: ANALYTICS OVERVIEW
            ---------------------------------------------------- */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            
            {/* SVG custom glowing charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Document Upload Timeline */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Upload Trends (6 Months)</h3>
                  <span className="text-[10px] text-zinc-500 block">Growth of indexed documents in the database</span>
                </div>

                {/* SVG Line Graph */}
                <div className="w-full aspect-[2/1] bg-zinc-950/40 rounded-2xl p-4 border border-white/5 flex items-end justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 400 180">
                    {/* Grid Lines */}
                    <line x1="30" y1="20" x2="390" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="60" x2="390" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="100" x2="390" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="140" x2="390" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Gradient under line */}
                    <path 
                      d="M 30 140 L 90 120 L 150 115 L 210 90 L 270 65 L 330 35 L 390 20 L 390 140 Z" 
                      fill="url(#purpleGlow)" 
                      opacity="0.1" 
                    />
                    
                    {/* Glowing Line */}
                    <path 
                      d="M 30 140 L 90 120 L 150 115 L 210 90 L 270 65 L 330 35 L 390 20" 
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      className="glow-text-primary"
                    />

                    {/* Circles on Nodes */}
                    <circle cx="90" cy="120" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="210" cy="90" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="330" cy="35" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="390" cy="20" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Axis descriptors */}
                  <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[9px] font-mono text-zinc-600">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Category distribution (Bar graph style) */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Category Allocation</h3>
                  <span className="text-[10px] text-zinc-500 block">Mapping distributions across different domains</span>
                </div>

                <div className="w-full aspect-[2/1] bg-zinc-950/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-around">
                  {categories.map((cat, i) => {
                    const colors = ["bg-purple-500", "bg-cyan-400", "bg-pink-400", "bg-amber-400", "bg-red-400"];
                    const percent = Math.floor(Math.random() * 40) + 15;
                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                          <span>{cat.name}</span>
                          <span className="font-mono text-zinc-500">{percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* General Database counts details table */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">Raw Analytics Indices</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 bg-zinc-900/30 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Chunks generated</span>
                  <span className="text-xl font-bold text-zinc-200">1,245 Chunks</span>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Embed dimension</span>
                  <span className="text-xl font-bold text-zinc-200">384 Dimensions</span>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">Queries executed</span>
                  <span className="text-xl font-bold text-zinc-200">932 Searches</span>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block">LLM Calls</span>
                  <span className="text-xl font-bold text-zinc-200">415 API hits</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB 9: CONFIGURATION AND PROFILE SETTINGS
            ---------------------------------------------------- */}
        {activeTab === "settings" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Workspace details */}
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white">System Configurations</h3>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">LLM Switching</span>
              </div>

              <div className="space-y-4">
                
                {/* Switch active provider API */}
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
                        className={`p-4 border rounded-2xl text-left transition-all ${
                          activeLLMProvider === p.id 
                            ? "bg-purple-600/10 border-purple-500/30 text-purple-300" 
                            : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className="text-xs font-bold block">{p.label}</span>
                        <span className="text-[9px] text-zinc-500 block mt-1">{p.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key credential insertion mock */}
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
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <span className="text-[9px] text-zinc-600 block">Overrides active default credential keys set inside server `.env` files.</span>
                  </div>
                )}

              </div>
            </div>

            {/* Profile setup card */}
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white">Developer Account Details</h3>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">User Identity</span>
              </div>

              <div className="flex items-center space-x-4 border-b border-white/5 pb-6">
                <div className="w-14 h-14 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                  AK
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-zinc-200">Abhinav Krishnan</h4>
                  <p className="text-zinc-500 text-xs">Primary System Administrator | abhinav@example.com</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                <div className="space-y-1">
                  <span>Current workspace:</span>
                  <span className="text-zinc-300 font-semibold block">/Users/USER/KnowledgeOS/Vault</span>
                </div>
                <div className="space-y-1">
                  <span>User role:</span>
                  <span className="text-zinc-300 font-semibold block">Development Owner</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
