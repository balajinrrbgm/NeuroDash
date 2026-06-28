import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedbackItems } from '@/db/schema';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, sourceId, metadata } = body;

    if (!content || !sourceId) {
      return NextResponse.json({ error: 'Missing content or sourceId' }, { status: 400 });
    }

    // 1. Generate embedding using local fastembed (BGE-small, 384 dims, no API key needed)
    const embedding = await generateEmbedding(content);

    // 2. Perform sentiment analysis (simple prompt or model call)
    // For hackathon purposes, we mock it or use a fast completion call
    const sentiment = 'neutral'; // Placeholder

    // 3. Store in Amazon Aurora PostgreSQL with pgvector
    const result = await db.insert(feedbackItems).values({
      sourceId,
      content,
      sentiment,
      metadata,
      embedding,
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
