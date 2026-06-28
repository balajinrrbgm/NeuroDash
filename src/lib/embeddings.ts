import { EmbeddingModel, FlagEmbedding } from 'fastembed';

// Singleton — initialised once per process, model cached on disk after first download
let embedder: FlagEmbedding | null = null;

async function getEmbedder(): Promise<FlagEmbedding> {
  if (!embedder) {
    embedder = await FlagEmbedding.init({
      model: EmbeddingModel.BGESmallENV15, // 384-dim, ~25 MB, no API key required
    });
  }
  return embedder;
}

/**
 * Generate a 384-dimension embedding for any text string.
 * Uses BAAI/bge-small-en-v1.5 via ONNX Runtime (local, no network call after first download).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const emb = await getEmbedder();
  return emb.queryEmbed(text);
}
