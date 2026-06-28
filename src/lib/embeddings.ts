import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Singleton client — reused across requests
let client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || 'eu-central-1',
    });
  }
  return client;
}

/**
 * Generate a 1536-dimension embedding using Amazon Bedrock Titan Text Embeddings v1.
 * Credentials are loaded automatically from AWS_PROFILE / environment variables.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const command = new InvokeModelCommand({
    modelId: 'amazon.titan-embed-text-v1',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ inputText: text }),
  });

  const response = await getClient().send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.embedding as number[];
}
