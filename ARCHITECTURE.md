# NeuroDash Architecture

This document outlines the architecture for **NeuroDash**, detailing how the frontend generated with v0 and deployed on Vercel seamlessly integrates with Amazon Aurora PostgreSQL to deliver a production-ready, highly scalable B2B customer intelligence platform.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph "Frontend (Vercel)"
        UI[Next.js App Router (v0 scaffolded)]
        Dash[Real-Time Analytics Dashboard]
        Search[Natural Language Search Interface]
        UI --> Dash
        UI --> Search
    end

    subgraph "Serverless Edge API (Vercel)"
        Ingest[Ingestion API Route]
        Query[Semantic Search API Route]
    end

    subgraph "AI Provider"
        Embed[LLM Embedding API (OpenAI/Gemini)]
    end

    subgraph "AWS Zero Stack"
        DB[(Amazon Aurora PostgreSQL)]
        pg[pgvector Extension]
        DB --- pg
    end

    %% Flow
    Dash -->|Fetch Metrics| Query
    Search -->|Natural Language Query| Query
    
    Query -->|1. Generate Embedding| Embed
    Embed -->|Vector| Query
    Query -->|2. Cosine Similarity Search| DB
    
    External[External Integrations (Zendesk, Intercom, etc.)] -->|Push Feedback| Ingest
    Ingest -->|1. Generate Embedding| Embed
    Embed -->|Vector| Ingest
    Ingest -->|2. Store Data & Vector| DB
```

## Components

1. **Vercel (Frontend & Serverless APIs)**: 
   - **Frontend**: The user interface is built using Next.js and styled with Tailwind CSS, scaffolded heavily using v0 to achieve a stunning, responsive, and accessible modern B2B application design.
   - **APIs**: Vercel Serverless Functions process incoming data and serve search requests. They are optimized for low latency and scale automatically with traffic.

2. **Amazon Aurora PostgreSQL (AWS Database)**:
   - This forms the core of our "Zero Stack" backend designed for scale. Aurora provides the performance and availability of commercial-grade databases at 1/10th the cost.
   - We utilize the `pgvector` extension within Aurora to store high-dimensional embeddings of all customer feedback. This enables blazing-fast semantic searches across millions of feedback items, something traditional relational databases struggle with natively.

3. **AI Embeddings Model**:
   - Transforms unstructured text (like support tickets and reviews) into semantic vector representations that are stored in the AWS Database.
