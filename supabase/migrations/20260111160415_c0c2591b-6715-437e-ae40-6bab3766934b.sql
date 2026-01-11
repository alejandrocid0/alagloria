-- Crear tabla lista_lanzamiento con la misma estructura que waitlist_subscribers
CREATE TABLE public.lista_lanzamiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  notes text
);

-- Habilitar RLS
ALTER TABLE public.lista_lanzamiento ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserciones públicas
CREATE POLICY "Allow public inserts to lista_lanzamiento"
  ON public.lista_lanzamiento
  FOR INSERT
  WITH CHECK (true);

-- Política para administración con service role
CREATE POLICY "Service role can manage lista_lanzamiento"
  ON public.lista_lanzamiento
  FOR ALL
  USING (true)
  WITH CHECK (true);