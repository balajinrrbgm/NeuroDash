import { pgTable, serial, text, timestamp, json, customType } from 'drizzle-orm/pg-core';

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(384)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const feedbackSources = pgTable('feedback_sources', {
  id: serial('id').primaryKey(),
  workspaceId: serial('workspace_id').references(() => workspaces.id),
  sourceType: text('source_type').notNull(), // 'zendesk', 'intercom', 'custom'
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const feedbackItems = pgTable('feedback_items', {
  id: serial('id').primaryKey(),
  sourceId: serial('source_id').references(() => feedbackSources.id),
  content: text('content').notNull(),
  sentiment: text('sentiment'), // 'positive', 'neutral', 'negative'
  metadata: json('metadata'),
  embedding: vector('embedding'), // BGE-small embeddings are 384 dimensions
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
