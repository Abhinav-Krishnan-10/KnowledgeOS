# KnowledgeOS — Frontend

A premium, SaaS-style dashboard built with **Next.js 16**, **React 19**, and **Tailwind CSS 4** for the AI-powered Personal Knowledge Workspace.

## Overview

The frontend provides an intuitive interface that allows users to upload documents, search their personal knowledge base using semantic vector search, chat with an AI assistant grounded in their own files, and leverage AI-powered learning tools — all from a single, polished dashboard.

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI component library |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon system |
| **TypeScript** | Type safety |

## Key Features

- **Landing Page** — Marketing-style hero with feature highlights and a "How It Works" section.
- **Dashboard** — Central hub with system status, quick stats, and recent activity.
- **Document Library** — Upload, categorize, filter, and manage documents with real-time status tracking (uploaded → processing → indexed).
- **Semantic Search** — Vector-powered search across all uploaded documents with similarity scores.
- **AI Chat Assistant** — Conversational interface that answers questions grounded in your uploaded knowledge base, with cited sources.
- **Learning Assistant** — Generate summaries, flashcards, quizzes, concept explanations, and study notes from any document.
- **Content Generator** — Create resumes, project descriptions, reports, and portfolios using your documents as source material.
- **Analytics** — Visual breakdown of storage usage, category distribution, and generation history.

## Architecture

The frontend communicates with a **FastAPI** backend via REST API. If the backend is unavailable, a built-in **mock data layer** provides a fully interactive demo experience with simulated uploads, search results, and AI responses.

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── dashboard/
│   │       └── page.tsx      # Main dashboard (all features)
│   └── services/
│       └── api.ts            # API client with mock fallback
├── Dockerfile                # Container setup
├── package.json
└── tsconfig.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).
