import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedbackItems } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // 1. Generate embedding for the search query using local fastembed
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // 2. Perform Cosine Similarity Search in Aurora PostgreSQL (pgvector)
    // Using `<=>` operator for cosine distance
    const results = await db.execute(sql`
      SELECT id, content, sentiment, metadata, 
             1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM ${feedbackItems}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `);

    return NextResponse.json({ success: true, data: results.rows });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
