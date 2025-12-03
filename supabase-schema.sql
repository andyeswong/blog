-- Schema para tabla de posts en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'AWONG',
  reading_time INTEGER NOT NULL DEFAULT 5,
  content TEXT NOT NULL,
  created_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modification_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'published',
  seo_keywords TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0
);

-- Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_posts_created_time ON posts(created_time DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Habilitar Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer posts publicados
CREATE POLICY "Posts públicos son visibles para todos"
  ON posts FOR SELECT
  USING (status = 'published');

-- Política: Permitir todas las operaciones sin autenticación (para tu caso de uso actual)
-- NOTA: En producción, deberías configurar autenticación adecuada
CREATE POLICY "Permitir todas las operaciones"
  ON posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Función para actualizar modification_time automáticamente
CREATE OR REPLACE FUNCTION update_modification_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modification_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar modification_time en cada UPDATE
CREATE TRIGGER update_posts_modification_time
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_modification_time();

-- Comentarios en la tabla para documentación
COMMENT ON TABLE posts IS 'Almacena todos los posts del blog';
COMMENT ON COLUMN posts.id IS 'ID único del post (formato: 000-slug)';
COMMENT ON COLUMN posts.tags IS 'Array de etiquetas del post';
COMMENT ON COLUMN posts.featured IS 'Indica si el post está destacado';
COMMENT ON COLUMN posts.views IS 'Contador de vistas del post';
