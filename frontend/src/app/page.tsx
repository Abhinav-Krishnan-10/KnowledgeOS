"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Search, 
  MessageSquare, 
  Brain, 
  Zap, 
  ShieldCheck, 
  FileText, 
  UploadCloud, 
  Star,
  Cpu,
  Layers,
  ArrowRightLeft
} from "lucide-react";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      icon: <Search className="w-6 h-6 text-cyan-400" />,
      title: "Semantic Vector Search",
      description: "Search for concepts and meanings, not just exact keywords. Get highly relevant context in milliseconds using pgvector."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      title: "Grounded AI Chat",
      description: "Ask questions and chat with your documents. Receive source-referenced answers directly linked to specific passages."
    },
    {
      icon: <Brain className="w-6 h-6 text-pink-400" />,
      title: "Active Learning Suite",
      description: "Instantly convert documents into structured revision notes, interactive study flashcards, and multiple-choice quizzes."
    },
    {
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      title: "Smart Content Generator",
      description: "Synthesize resume drafts, detailed technical reports, or project abstracts grounded directly in your personal archives."
    },
    {
      icon: <Zap className="w-6 h-6 text-red-400" />,
      title: "Lightning Fast Indexing",
      description: "Drop PDFs, Word, PowerPoint, or text files. The pipeline cleans, chunks, and indexes them in the background."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "100% Private & Secured",
      description: "Your knowledge base remains entirely yours. Run local models via Ollama for a completely offline, secure environment."
    }
  ];

  const steps = [
    {
      title: "Ingest Documents",
      subtitle: "Drag & drop files",
      description: "Upload PDFs, TXT, DOCX, PPTX, or scanned images. Our pipeline handles parsing and OCR automatically in the background.",
      badge: "Step 01"
    },
    {
      title: "Generate Embeddings",
      subtitle: "Vector Mapping",
      description: "Text is broken into semantic chunks and mapped into 384-dimensional vector space using the BAAI embedding engine.",
      badge: "Step 02"
    },
    {
      title: "Synthesize Knowledge",
      subtitle: "AI Collaboration",
      description: "Query details through semantic search, chat with the assistant, generate study flashcards, or draft resume contents.",
      badge: "Step 03"
    }
  ];

  const testimonials = [
    {
      quote: "KnowledgeOS has completely replaced how I organize research papers. I can query across 50 documents simultaneously and get combined answers with footnotes. It's like having a co-researcher.",
      author: "Dr. Sarah Chen",
      role: "AI Research Fellow, Stanford",
      stars: 5
    },
    {
      quote: "Generating custom client pitch decks and project summaries from our team's archives used to take hours. Now, we grounding the Content Generator on our reports, and it writes them in seconds.",
      author: "Marcus Vane",
      role: "Product Principal, Stealth SaaS",
      stars: 5
    },
    {
      quote: "The ability to run local models through Ollama is a game changer. I keep all my company's financial planning completely local, private, and offline. Superb product.",
      author: "Elena Rostova",
      role: "Chief Financial Analyst",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-mesh text-foreground">
      {/* Floating Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Knowledge<span className="text-purple-400 font-extrabold">OS</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Documentation</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all flex items-center space-x-1.5 glow-btn"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center space-y-6 relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-white/5 text-xs font-semibold text-purple-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI-Powered Personal Knowledge Hub</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Your Documents, <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Infused with Intelligence
            </span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 font-normal leading-relaxed">
            Upload PDFs, text, slides, and images to build a semantic workspace. 
            Instantly query text, generate interactive flashcards, take quizzes, 
            and synthesize new documents grounded strictly in your files.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 glass-panel border border-white/5 hover:border-white/10 text-zinc-300 font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2 hover:bg-white/5"
            >
              <span>Explore Features</span>
            </a>
          </div>
        </div>

        {/* Hero Interactive Mockup */}
        <div className="mt-16 relative z-10 max-w-5xl mx-auto glass-panel border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/5 p-2 overflow-hidden animate-float">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />
          <div className="rounded-xl bg-zinc-950/80 p-4 md:p-6 overflow-hidden">
            {/* Mock Dashboard Layout */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="px-6 py-1 bg-zinc-900 border border-white/5 rounded-lg text-xs font-mono text-zinc-500">
                https://workspace.knowledgeos.ai/dashboard
              </div>
              <div className="w-4 h-4 bg-zinc-800 rounded-md" />
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* Sidebar Mock */}
              <div className="col-span-3 hidden md:block space-y-2 border-r border-white/5 pr-4">
                <div className="h-7 bg-purple-500/20 border border-purple-500/10 rounded-lg flex items-center px-2 text-xs font-bold text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Overview
                </div>
                <div className="h-7 hover:bg-white/5 rounded-lg flex items-center px-2 text-xs text-zinc-500 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload Center
                </div>
                <div className="h-7 hover:bg-white/5 rounded-lg flex items-center px-2 text-xs text-zinc-500 transition-colors">
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Semantic Search
                </div>
                <div className="h-7 hover:bg-white/5 rounded-lg flex items-center px-2 text-xs text-zinc-500 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> AI Chat Hub
                </div>
              </div>

              {/* Main Content Mock */}
              <div className="col-span-12 md:col-span-9 space-y-4">
                {/* Stats grid mockup */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Knowledge Growth</span>
                    <span className="font-bold text-lg text-white">4.2 GB</span>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-full w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Indexed Items</span>
                    <span className="font-bold text-lg text-white">142 Documents</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">✓ 100% vector synced</span>
                  </div>
                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Search Requests</span>
                    <span className="font-bold text-lg text-white">932 Queries</span>
                    <span className="text-[9px] text-cyan-400 block mt-1">⚡ Avg 12ms similarity score</span>
                  </div>
                </div>

                {/* Chat window mockup */}
                <div className="border border-white/5 rounded-xl bg-zinc-900/40 p-4 space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">User</div>
                    <div className="bg-zinc-800/80 border border-white/5 rounded-xl p-2.5 text-xs text-zinc-300 max-w-[80%]">
                      Can you explain the main conclusions of our FY2026 sales forecasting sheet?
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 justify-end">
                    <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-200 max-w-[85%]">
                      <div className="font-bold text-purple-400 mb-1 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> KnowledgeOS AI Assistant
                      </div>
                      The sales forecasting sheet projects a total revenue of **$2.4M ARR by end of FY2026**. 
                      The key cohort is custom enterprise setups, driving 60% of forecast revenue.
                      
                      <div className="mt-2.5 pt-2 border-t border-purple-500/10 flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Cites:</span>
                        <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">Revenue_Projections_2026.docx</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[9px] text-white">AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/5 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400">Core Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Equipped with Advanced AI Tools</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Designed from scratch to operate as a high-fidelity workspace. 
              We replace standard keywords with deep conceptual comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-purple-500/10 transition-all" />
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-purple-500/20 group-hover:bg-purple-950/10 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the System Works */}
      <section id="workflow" className="py-24 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-20">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">Architecture Flow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">How the System Operates</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              KnowledgeOS implements an end-to-end Retrieval-Augmented Generation workflow in three clean stages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            <div className="hidden lg:block absolute top-16 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 -z-10" />

            {steps.map((s, idx) => (
              <div key={idx} className="relative space-y-4 text-center lg:text-left group">
                <div className="mx-auto lg:mx-0 w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:border-purple-500 group-hover:text-purple-300 transition-all shadow-lg">
                  {s.badge}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-purple-400 block">{s.subtitle}</span>
                  <h3 className="font-bold text-lg text-white">{s.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-white/5 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-pink-400">Social Proof</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Loved by Researchers and Teams</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Here is how students, developers, and analysts use KnowledgeOS to transform their reading lists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm italic leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.author}</h4>
                    <span className="text-xs text-zinc-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden max-w-6xl mx-auto mb-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 to-indigo-950/15 rounded-3xl border border-white/10 -z-10 shadow-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[80px] -z-10 animate-pulse-glow" />
        
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to Build Your <br />
            <span className="text-purple-400">Intelligent Knowledge Base?</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Join developers, designers, and students building their local memory boxes. 
            Free setup, containerized deployment, and full support for local LLMs.
          </p>
          <div className="pt-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all glow-btn"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-zinc-950/90 text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">
                Knowledge<span className="text-purple-400">OS</span>
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Transform unstructured files into searchable semantic vectors, building a powerful co-pilot workspace.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest text-purple-400">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-zinc-300 transition-colors">Features</a></li>
              <li><a href="#workflow" className="hover:text-zinc-300 transition-colors">Workflow</a></li>
              <li><a href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard Workspace</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest text-cyan-400">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="https://github.com" className="hover:text-zinc-300 transition-colors">Documentation</a></li>
              <li><a href="https://github.com" className="hover:text-zinc-300 transition-colors">System Design PDF</a></li>
              <li><a href="https://github.com" className="hover:text-zinc-300 transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest text-pink-400">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-300 transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-zinc-300 transition-colors">Security Details</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 text-center text-xs text-zinc-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 KnowledgeOS Inc. Built for hackathons, portfolios, and startup showcases.</span>
          <div className="flex space-x-6 text-zinc-600">
            <span>Next.js + TypeScript + FastAPI + pgvector</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
