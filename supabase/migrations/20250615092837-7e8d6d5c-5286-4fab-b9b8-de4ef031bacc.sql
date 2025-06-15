
-- Habilita Row Level Security si no está habilitado
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Borra posibles políticas DELETE anteriores que puedan interferir
DROP POLICY IF EXISTS "Permitir eliminar solo desde Service Role" ON public.waitlist_subscribers;

-- Crea una política que SOLO permite eliminar a conexiones desde el Service Role (como el panel)
CREATE POLICY "Permitir eliminar solo desde Service Role"
  ON public.waitlist_subscribers
  FOR DELETE
  TO service_role
  USING (true);
