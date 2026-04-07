-- ORION Gestão Executiva — Criação de Buckets de Armazenamento
-- Execute este script no SQL Editor do painel Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query → Cole e execute

-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Bucket para logos das empresas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Bucket para a biblioteca de documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('biblioteca', 'biblioteca', false, 20971520, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para avatars (leitura pública, escrita autenticada)
CREATE POLICY "Avatars — leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Avatars — upload pelo próprio usuário" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatars — atualização pelo próprio usuário" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas RLS para logos (leitura pública, escrita admin)
CREATE POLICY "Logos — leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Logos — upload autenticado" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Logos — atualização autenticada" ON storage.objects
  FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Políticas RLS para biblioteca (somente usuários autenticados)
CREATE POLICY "Biblioteca — leitura autenticada" ON storage.objects
  FOR SELECT USING (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');

CREATE POLICY "Biblioteca — upload autenticado" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');

CREATE POLICY "Biblioteca — exclusão autenticada" ON storage.objects
  FOR DELETE USING (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');
