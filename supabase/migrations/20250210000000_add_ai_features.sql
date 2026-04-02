-- Add AI description columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_description_generated_at TIMESTAMPTZ;

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (1536 dimensions for text-embedding-3-small)
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_products_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20,
  user_tier int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  ai_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.ai_description,
    1 - (p.description_embedding <=> query_embedding) as similarity
  FROM products p
  WHERE p.archive = false
    AND p.description_embedding IS NOT NULL
    AND p.tier_required <= user_tier
    AND 1 - (p.description_embedding <=> query_embedding) > match_threshold
  ORDER BY p.description_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
