// API Service client for KnowledgeOS
// Communicates with the FastAPI backend at http://localhost:8000/api
// Automatically falls back to high-fidelity mock data if the backend is offline.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Document {
  id: number;
  name: string;
  file_path: string;
  size_bytes: number;
  category_id?: number;
  status: 'uploaded' | 'processing' | 'indexed' | 'failed';
  created_at: string;
}

export interface SearchResult {
  chunk_id: number;
  document_id: number;
  document_name: string;
  text: string;
  chunk_index: number;
  similarity_score: number;
}

export interface ChatResponse {
  answer: string;
  retrieved_context: Array<{
    text: string;
    document_name: string;
    chunk_index: number;
  }>;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface ExplanationResponse {
  concept?: string;
  level: string;
  explanation: string;
}

export interface SummaryResponse {
  summary: string;
}

export interface NotesResponse {
  notes: string;
}

export interface GeneratedContentResponse {
  content_type: string;
  instructions: string;
  document_ids?: number[];
  content: string;
}

export interface SystemStatus {
  status: string;
  environment: string;
  database: {
    connected: boolean;
    total_documents: number;
    total_categories: number;
  };
  llm_abstraction: {
    active_provider: string;
    configured: boolean;
    model_name: string;
  };
  embeddings: {
    model_name: string;
  };
}

export interface AnalyticsOverview {
  total_documents: number;
  storage_usage_mb: number;
  categories_breakdown: Record<string, number>;
  generations_breakdown: Record<string, number>;
  recently_uploaded: Array<{
    id: number;
    name: string;
    status: string;
    created_at: string;
  }>;
}

// ----------------------------------------------------
// HIGH-FIDELITY IN-MEMORY MOCK STORE FOR FALLBACKS
// ----------------------------------------------------
let mockCategories: Category[] = [
  { id: 1, name: 'Engineering', description: 'Technical design, APIs, database architectures' },
  { id: 2, name: 'Finance', description: 'Budgets, revenue forecasting, business models' },
  { id: 3, name: 'Marketing', description: 'SaaS playbook, launch guidelines, branding' },
  { id: 4, name: 'Physics', description: 'Academic literature on quantum models' },
  { id: 5, name: 'Career', description: 'Resumes, cover letters, portfolios' }
];

let mockDocuments: Document[] = [
  { id: 101, name: 'KnowledgeOS_System_Design.pdf', file_path: '/storage/KnowledgeOS_System_Design.pdf', size_bytes: 3565158, category_id: 1, status: 'indexed', created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
  { id: 102, name: 'Revenue_Projections_2026.docx', file_path: '/storage/Revenue_Projections_2026.docx', size_bytes: 471859, category_id: 2, status: 'indexed', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 103, name: 'SaaS_Startup_Launch_Playbook.txt', file_path: '/storage/SaaS_Startup_Launch_Playbook.txt', size_bytes: 87040, category_id: 3, status: 'indexed', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 104, name: 'Quantum_Computing_Overview.pdf', file_path: '/storage/Quantum_Computing_Overview.pdf', size_bytes: 1258291, category_id: 4, status: 'indexed', created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 105, name: 'Resume_Abhinav_Krishnan.pdf', file_path: '/storage/Resume_Abhinav_Krishnan.pdf', size_bytes: 220200, category_id: 5, status: 'uploaded', created_at: new Date().toISOString() }
];

let mockSearchHistory: any[] = [];

// Helper to determine if backend is online
let activeProvider = 'gemini';
let customApiKey = '';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (activeProvider) {
    headers['X-LLM-Provider'] = activeProvider;
  }
  if (customApiKey) {
    headers['X-LLM-API-Key'] = customApiKey;
  }
  return headers;
}

export const api = {
  setLLMConfig(provider: string, apiKey: string) {
    activeProvider = provider;
    customApiKey = apiKey;
  },

  // 1. System Status
  async getStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        status: 'online (simulated)',
        environment: 'development',
        database: {
          connected: true,
          total_documents: mockDocuments.length,
          total_categories: mockCategories.length
        },
        llm_abstraction: {
          active_provider: 'gemini (mock)',
          configured: true,
          model_name: 'gemini-2.5-flash'
        },
        embeddings: {
          model_name: 'BAAI/bge-small-en-v1.5'
        }
      };
    }
  },

  // 2. Document Services
  async listDocuments(categoryId?: number): Promise<Document[]> {
    try {
      const url = categoryId ? `${API_BASE}/documents?category_id=${categoryId}` : `${API_BASE}/documents`;
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      if (categoryId) {
        return mockDocuments.filter(d => d.category_id === categoryId);
      }
      return mockDocuments;
    }
  },

  async uploadDocument(file: File, categoryId?: number): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = categoryId ? `${API_BASE}/documents/upload?category_id=${categoryId}` : `${API_BASE}/documents/upload`;
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // Simulate local upload and trigger status cycle
      const newDoc: Document = {
        id: Math.floor(Math.random() * 1000) + 200,
        name: file.name,
        file_path: `/storage/${file.name}`,
        size_bytes: file.size,
        category_id: categoryId,
        status: 'uploaded',
        created_at: new Date().toISOString()
      };
      
      mockDocuments = [newDoc, ...mockDocuments];

      // Simulate status change in mock store after 4 seconds
      setTimeout(() => {
        const found = mockDocuments.find(d => d.id === newDoc.id);
        if (found) found.status = 'processing';
        setTimeout(() => {
          const found2 = mockDocuments.find(d => d.id === newDoc.id);
          if (found2) found2.status = 'indexed';
        }, 3000);
      }, 2000);

      return {
        document_id: newDoc.id,
        filename: newDoc.name,
        status: newDoc.status,
        message: "File uploaded successfully to simulated sandbox. Indexing simulation initiated."
      };
    }
  },

  async deleteDocument(documentId: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/documents/${documentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      mockDocuments = mockDocuments.filter(d => d.id !== documentId);
      return { status: 'success', message: `Document ID ${documentId} deleted from simulated sandbox.` };
    }
  },

  // 3. Category Services
  async listCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/documents/categories`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return mockCategories;
    }
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/documents/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const newCat: Category = {
        id: mockCategories.length + 1,
        name,
        description
      };
      mockCategories.push(newCat);
      return newCat;
    }
  },

  // 4. Analytics
  async getAnalytics(): Promise<AnalyticsOverview> {
    try {
      const res = await fetch(`${API_BASE}/documents/analytics`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // Calculate mock breakdown
      const totalBytes = mockDocuments.reduce((acc, d) => acc + d.size_bytes, 0);
      const storageMb = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
      
      const categoriesBreakdown: Record<string, number> = {};
      mockDocuments.forEach(doc => {
        const cat = mockCategories.find(c => c.id === doc.category_id);
        const catName = cat ? cat.name : 'Uncategorized';
        categoriesBreakdown[catName] = (categoriesBreakdown[catName] || 0) + 1;
      });

      return {
        total_documents: mockDocuments.length,
        storage_usage_mb: storageMb,
        categories_breakdown: categoriesBreakdown,
        generations_breakdown: {
          'summary': 4,
          'flashcard': 12,
          'quiz': 8,
          'notes': 15,
          'generated_resume': 2,
          'generated_report': 3
        },
        recently_uploaded: mockDocuments.slice(0, 5).map(d => ({
          id: d.id,
          name: d.name,
          status: d.status,
          created_at: d.created_at
        }))
      };
    }
  },

  // 5. Semantic Search
  async search(query: string, limit: number = 5, documentId?: number, categoryId?: number): Promise<{ query: string; results: SearchResult[] }> {
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit, document_id: documentId, category_id: categoryId })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // Simulate search results based on keyword matching against mock files
      const cleanQuery = query.toLowerCase();
      let targets = mockDocuments;
      if (documentId) targets = targets.filter(t => t.id === documentId);
      if (categoryId) targets = targets.filter(t => t.category_id === categoryId);

      const snippets = [
        `This section of the document details the technical setup. The KnowledgeOS service is written in Python using FastAPI, communicating with pgvector as a semantic database store. Standard REST routes are loaded dynamically to provide LLM abstractions, indexing triggers, and educational pipelines.`,
        `The financial models forecast a 45% CAGR in recurring SaaS subscription revenue over the next three fiscal years. Our cash position is healthy, with initial seed funds supporting scaling. Customer acquisition cost (CAC) payback period remains under 7 months.`,
        `Product launch requirements highlight an agile marketing campaign across Twitter, LinkedIn, and ProductHunt. Ideal launch window is Q3. Key channels involve partnering with developer tool creators to showcase our vector retrieval optimizations.`,
        `Quantum states are simulated using traditional Hamiltonian representations. Using superconducting qubits, we measure coherence times up to 150 microseconds. Gate fidelity is assessed via randomized benchmarking.`,
        `Abhinav Krishnan has over 5 years of software engineering experience developing full stack Next.js apps, Docker compose multi-service containers, PostgreSQL integrations, and LangChain AI modules.`
      ];

      const results: SearchResult[] = [];
      let index = 1;
      
      targets.forEach((doc) => {
        let text = snippets[doc.id % snippets.length];
        
        // Boost score if keyword matches
        let score = 0.65 + Math.random() * 0.15;
        if (cleanQuery && (doc.name.toLowerCase().includes(cleanQuery) || text.toLowerCase().includes(cleanQuery))) {
          score += 0.15;
        }
        score = Math.min(score, 0.98);

        results.push({
          chunk_id: index * 10,
          document_id: doc.id,
          document_name: doc.name,
          text: text,
          chunk_index: index,
          similarity_score: parseFloat(score.toFixed(3))
        });
        index++;
      });

      // Sort by score
      results.sort((a, b) => b.similarity_score - a.similarity_score);

      return {
        query,
        results: results.slice(0, limit)
      };
    }
  },

  // 6. Conversational Chat
  async chat(query: string, limit: number = 5, documentId?: number, categoryId?: number): Promise<ChatResponse> {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query, limit, document_id: documentId, category_id: categoryId })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // Simulate educational conversation grounded in selected document
      const cleanQuery = query.toLowerCase();
      let docName = 'Workspace Documents';
      if (documentId) {
        const found = mockDocuments.find(d => d.id === documentId);
        if (found) docName = found.name;
      }

      let answer = `I've analyzed your knowledge base regarding your request. Based on the documents inside your **${docName}** library, here is what I found:\n\n`;

      if (cleanQuery.includes('project') || cleanQuery.includes('system') || cleanQuery.includes('design')) {
        answer += `The **KnowledgeOS System Design** outlines a decoupled architecture:\n1. **Frontend**: Built on Next.js, React, and Tailwind CSS. It communicates asynchronously with the backend API.\n2. **Backend**: FastAPI manages the processing pipelines (PDF parsing via PyMuPDF, OCR via PaddleOCR).\n3. **Database**: PostgreSQL handles standard metadata and relational tables, while the \`pgvector\` extension stores the 384-dimensional vector embeddings generated by \`BAAI/bge-small-en-v1.5\`.\n\nWould you like me to create a summary of the container settings or explain the indexing flow?`;
      } else if (cleanQuery.includes('revenue') || cleanQuery.includes('finance') || cleanQuery.includes('forecast')) {
        answer += `According to the **Revenue Projections 2026** document, the company projects:\n- **Total Revenue**: Projected to reach $2.4M ARR by end of FY2026.\n- **Growth Rate**: Month-over-month growth target is steady at 12%.\n- **Key Driver**: Enterprise seats and custom AI integrations represent the fastest-growing cohort, accounting for 60% of forecast revenue.\n\nLet me know if you would like me to format this as a financial summary report.`;
      } else if (cleanQuery.includes('quantum') || cleanQuery.includes('physics')) {
        answer += `The academic paper **Quantum Computing Overview** explains that superconducting qubits are manipulated via microwave pulses inside a dilution refrigerator operating below 20mK. Coherence times (T1 and T2) are the primary bottleneck, and current research focuses on surface code error correction to achieve fault-tolerant computing.\n\nWould you like a quiz on these quantum principles to test your understanding?`;
      } else if (cleanQuery.includes('abhinav') || cleanQuery.includes('resume') || cleanQuery.includes('who is')) {
        answer += `Based on the uploaded **Resume of Abhinav Krishnan**, he is an experienced software engineer. His core skills include:\n- **Languages**: Python, TypeScript, JavaScript, SQL, HTML/CSS.\n- **Frameworks**: Next.js, React, FastAPI, SQLModel, LangChain, PyTorch.\n- **DevOps**: Docker, Docker Compose, Git, PostgreSQL.\n- **Interests**: Building production-ready RAG workspaces, AI search, and semantic knowledge retrieval applications.\n\nYou can use the Content Generator page to immediately customize a cover letter or portfolio description grounded in this resume.`;
      } else {
        answer += `I found several references in your uploads that might help. Your documents detail various aspects of software engineering, quantum physics, SaaS marketing, and financial forecasts.\n\nCould you clarify which document you'd like to ground the answer in? Alternatively, select a specific file from the category filters to query it directly.`;
      }

      return {
        answer,
        retrieved_context: [
          {
            text: `FastAPI backend serves endpoints. PostgreSQL handles documents, categories, generated content, and vector embeddings. Embedding dimension matches the 384 vector output of BAAI/bge-small-en-v1.5.`,
            document_name: 'KnowledgeOS_System_Design.pdf',
            chunk_index: 2
          },
          {
            text: `Our financial projections show steady growth, targeting cash flow break-even by Q4 2026. Seed round capital will be allocated to infrastructure costs and GPU fine-tuning services.`,
            document_name: 'Revenue_Projections_2026.docx',
            chunk_index: 4
          }
        ]
      };
    }
  },

  // 7. Learning Assistant Services
  async generateSummary(documentId: number, forceRegenerate: boolean = false): Promise<SummaryResponse> {
    try {
      const res = await fetch(`${API_BASE}/learning/summary`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ document_id: documentId, force_regenerate: forceRegenerate })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const doc = mockDocuments.find(d => d.id === documentId);
      const docName = doc ? doc.name : 'Document';
      return {
        summary: `# Summary of ${docName}

## Key Highlights
- **Intelligent RAG Framework**: Demonstrates semantic document matching, vector representation chunking, and contextual answer queries.
- **Enterprise-Ready Infrastructure**: Designed with containerized microservices (FastAPI, Next.js, pgvector, Redis).
- **Flexible Integration**: Supports multiple LLM targets including OpenAI, Gemini, and local Ollama modules.

## Core Concepts
1. **Semantic Chunking**: Breaking down document paragraphs by conceptual boundaries rather than raw character limits.
2. **Dense Embeddings**: Mapping text segments to high-dimensional space so that semantic relationships are represented by vector distances.
3. **Prompt Grounding**: Injecting retrieved context blocks directly into the LLM system prompt to prevent hallucinations.

## Concluding Summary
In conclusion, the document establishes a rigorous blueprint for deploying AI knowledge hubs. It addresses OCR capabilities for images and scanned files, fast indexing pipelines, and educational assistants, making it highly valuable for developers and teams.`
      };
    }
  },

  async generateFlashcards(documentId: number, count: number = 8, forceRegenerate: boolean = false): Promise<{ flashcards: Flashcard[] }> {
    try {
      const res = await fetch(`${API_BASE}/learning/flashcards`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ document_id: documentId, count, force_regenerate: forceRegenerate })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        flashcards: [
          { question: "What embedding model is recommended?", answer: "BAAI/bge-small-en-v1.5, which outputs a 384-dimensional vector." },
          { question: "Which vector extension is used in PostgreSQL?", answer: "pgvector, enabling fast cosine similarity searches directly via SQL queries." },
          { question: "What is the primary role of the FastAPI layer?", answer: "It manages the REST API endpoints, coordinates file extraction, schedules chunking, and interfaces with LLM providers." },
          { question: "What libraries are used for document parsing?", answer: "PyMuPDF for PDFs, python-docx for Word files, python-pptx for PowerPoint, and PaddleOCR for image scanned text." },
          { question: "What are the three supported LLM providers?", answer: "Google Gemini (Gemini 2.5 Flash), OpenAI (GPT-4o), and local offline models via Ollama (Llama 3, Mistral, Gemma)." }
        ].slice(0, count)
      };
    }
  },

  async generateQuiz(documentId: number, count: number = 5, forceRegenerate: boolean = false): Promise<{ quiz: QuizQuestion[] }> {
    try {
      const res = await fetch(`${API_BASE}/learning/quiz`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ document_id: documentId, count, force_regenerate: forceRegenerate })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        quiz: [
          {
            question: "Which component stores the generated vector representations of document chunks?",
            options: [
              "Standard PostgreSQL table",
              "Redis Cache service",
              "pgvector extension inside PostgreSQL",
              "Local text files directory"
            ],
            correct_answer: "pgvector extension inside PostgreSQL"
          },
          {
            question: "What is the dimensions of the vector embeddings created by the default bge-small-en model?",
            options: ["128", "256", "384", "1536"],
            correct_answer: "384"
          },
          {
            question: "Which python library handles OCR text extraction for scanned images in the pipeline?",
            options: ["PyMuPDF", "python-docx", "Tesseract-OCR", "PaddleOCR"],
            correct_answer: "PaddleOCR"
          },
          {
            question: "How does the system ensure the chat model does not hallucinate answers?",
            options: [
              "By disabling creative temperature settings",
              "By feeding relevant retrieved chunks of text as prompt context",
              "By searching Google Search in real-time",
              "By indexing the entire internet into a vector index"
            ],
            correct_answer: "By feeding relevant retrieved chunks of text as prompt context"
          },
          {
            question: "Which Docker container runs the default user interface?",
            options: ["postgres", "redis", "backend", "frontend"],
            correct_answer: "frontend"
          }
        ].slice(0, count)
      };
    }
  },

  async generateExplanation(documentId: number, concept?: string, level: string = 'simple'): Promise<ExplanationResponse> {
    try {
      const res = await fetch(`${API_BASE}/learning/explain`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ document_id: documentId, concept, level })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      let explanation = "";
      const target = concept || "Semantic Vector Search";
      
      if (level === 'simple') {
        explanation = `Imagine your documents are books in a giant magical library. 

Normally, to find something, you have to search for the exact word—like typing "dog" and matching pages. 

With **${target}**, the library has a magical index that understands *ideas*. When you ask "who is the best fuzzy pet?", the magical index knows that "dog", "cat", and "puppy" are related ideas, even if the word "pet" isn't on the page! It gives you the perfect page because it understands what you *mean*, not just the letters you type.`;
      } else if (level === 'intermediate') {
        explanation = `In intermediate terms, **${target}** translates words into mathematical coordinates called "embeddings". 

An AI model reads a sentence and places it in a map of meaning (vector space). Sentences with similar meanings (e.g., "artificial intelligence development" and "machine learning algorithms") are mapped close to each other, like cities on the same continent. 

When you search, the system plots your query on this map, measures the mathematical distance to nearest sentences using cosine similarity, and retrieves those close-by passages as search results.`;
      } else {
        explanation = `From a technical standpoint, **${target}** relies on translating variable-length textual data into high-dimensional numerical vectors using deep neural networks (transformers). 

Specifically, the default \`BAAI/bge-small-en-v1.5\` encoder processes textual inputs into a 384-dimensional dense floating-point vector space. 

Retrieval is executed by projecting a query string into the same embedding space, followed by running a nearest-neighbor search (e.g., using L2 distance, cosine similarity, or inner product operations). Within PostgreSQL, this is implemented using an HNSW index provided by the \`pgvector\` extension.`;
      }

      return {
        concept: target,
        level,
        explanation
      };
    }
  },

  async generateNotes(documentId: number): Promise<NotesResponse> {
    try {
      const res = await fetch(`${API_BASE}/learning/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ document_id: documentId })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        notes: `# Quick Study Cheat Sheet: RAG Architecture

## Core Definitions
* **RAG**: Retrieval-Augmented Generation. A technique where LLM models are supplemented with external, verified documents to output highly accurate answers.
* **Chunking**: Segmenting long documents into digestible paragraphs (often 500-1000 characters) to fit context windows and isolate specific points.
* **pgvector**: A PostgreSQL database extension that allows storage and fast indices of array numbers (vectors) representing text meaning.

> [!NOTE]
> Cosine similarity is the primary metric used to compare the angle between two vectors. A higher cosine similarity (closer to 1.0) indicates stronger semantic overlap.

## Key Formulas & Parameters
* **Chunk size**: 512 tokens
* **Chunk overlap**: 50 tokens (ensures context isn't lost at boundaries)
* **Embedding Dimension**: 384 numbers
* **Cosine Similarity Limit**: > 0.70 threshold for relevance

## Architecture Checklist
1. User uploads document.
2. Parsers extract raw strings.
3. Clean text is divided into chunks.
4. Chunks are passed to BAAI model to generate vectors.
5. Vectors are stored in pgvector.
6. Queries search vectors; top results are sent with the query to the Gemini/OpenAI API.`
      };
    }
  },

  // 8. Content Generator Services
  async generateContent(contentType: string, instructions: string, documentIds?: number[]): Promise<GeneratedContentResponse> {
    try {
      const res = await fetch(`${API_BASE}/generation/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content_type: contentType, instructions, document_ids: documentIds })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      let docTitle = 'Workspace Archives';
      if (documentIds && documentIds.length > 0) {
        const doc = mockDocuments.find(d => d.id === documentIds[0]);
        if (doc) docTitle = doc.name;
      }

      let content = "";
      if (contentType === 'resume') {
        content = `# ABHINAV KRISHNAN
*San Francisco, CA | abhinav@example.com | github.com/abhinav*

## Professional Summary
Highly skilled and innovative Software Engineer with extensive experience developing full-stack AI applications, vector databases, and responsive React interfaces. Expert in implementing Retrieval-Augmented Generation (RAG) pipelines, embedding generation, and scalable web solutions.

## Technical Skills
- **Languages**: Python, TypeScript, JavaScript, SQL, HTML5, CSS3
- **Frameworks & Libraries**: Next.js, React, FastAPI, SQLModel, Tailwind CSS, LangChain, Framer Motion
- **Databases**: PostgreSQL (pgvector), Redis, SQLite
- **DevOps**: Docker, Docker Compose, AWS, Git, CI/CD

## Professional Experience
### Lead AI Developer | Stealth Startup (Simulated Sandbox)
*2024 - Present*
- Architected a premium AI Personal Knowledge Workspace, leading to a 40% improvement in semantic document lookup.
- Optimized text extraction using PyMuPDF and OCR pipelines, enabling indexing of complex scanned reports.
- Containerized Next.js and FastAPI services via Docker Compose, facilitating dev-prod environment parity.

## Projects
### KnowledgeOS Workspace
*Grounded in: ${docTitle}*
- Developed a high-fidelity semantic workspace integrating vector databases and ChatGPT-style document chat.
- Created interactive quizzes, flashcards, and summary generators based on custom-loaded documents.`;
      } else if (contentType === 'project_description') {
        content = `# Project: KnowledgeOS - AI Knowledge Workspace
**Coordinated with:** ${docTitle}

## Executive Summary
KnowledgeOS is an intelligent SaaS workspace that bridges document storage with conversational AI. Users upload personal PDFs, text archives, or presentations, transforming unstructured files into structured semantic vectors.

## Key Technical Achievements
1. **Decoupled Architecture**: Utilizes Next.js on the presentation layer, connecting via REST endpoints to a FastAPI backend.
2. **Vector Space Mapping**: Converts document segments to 384-dimensional dense vectors stored using the \`pgvector\` extension.
3. **Advanced Learning Suite**: Employs Gemini LLM API calls to dynamically compile study guides, generate revision flashcards, and evaluate comprehension through multiple-choice quizzes.
4. **Content Generation Engine**: Enables direct workspace creation (resumes, reports, portfolio content) by referencing uploaded user materials, guaranteeing high accuracy and hyper-personalization.`;
      } else if (contentType === 'report') {
        content = `# Technical Analysis Report: Semantic Search Optimization
**Reference material:** ${docTitle}

## 1. Introduction
This report evaluates search retrieval accuracy across multi-format personal knowledge bases. We compare traditional keyword-based algorithms with vector similarity search.

## 2. Methodology
- **Vector Space**: Embeddings generated using \`BAAI/bge-small-en-v1.5\`.
- **Database**: PostgreSQL 16 utilizing pgvector index.
- **Metric**: Cosine similarity.

## 3. Findings
We assessed search queries against a dataset of 5 documents containing technical details, business figures, and physics concepts.

| Search Type | Average Recall | F1 Score | Hallucination Rate |
| :--- | :---: | :---: | :---: |
| Keyword (Lexical) | 54.2% | 0.58 | N/A |
| **Semantic Vector** | **89.5%** | **0.84** | **< 2% (grounded)** |

## 4. Conclusion
Integrating dense vector retrieval dramatically increases lookup accuracy and ensures conversational models have access to relevant document context.`;
      } else {
        content = `# Portfolio Summary: AI Engineering
**Gronded in files:** ${docTitle}

## About Me
I am a builder specializing in the intersection of traditional software engineering and generative AI. I focus on creating polished, human-centric user interfaces that make complex AI tasks intuitive.

## Featured Work: KnowledgeOS
A fully interactive dashboard demonstrating document upload pipelines, background indexing indicators, semantic search panels, chat assistants with cited sources, and study tools.

- **Frontend Tech**: React, Next.js, Tailwind CSS, Framer Motion
- **Backend Tech**: FastAPI, SQLModel, pgvector, Docker Compose
- **Active LLM Provider**: Gemini 2.5 Flash / GPT-4o`;
      }

      return {
        content_type: contentType,
        instructions,
        document_ids: documentIds,
        content
      };
    }
  }
};
