-- ============================================================
-- AnıKare — Supabase Schema
-- Supabase Panel > SQL Editor > New query > Çalıştır
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE event_type AS ENUM (
  'wedding', 'birthday', 'graduation', 'engagement', 'other'
);
CREATE TYPE package_type AS ENUM ('eco', 'standard', 'premium');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.events (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title                 TEXT NOT NULL,
  event_type            event_type NOT NULL DEFAULT 'wedding',
  slug                  TEXT UNIQUE NOT NULL,
  event_date            DATE,
  cover_image_key       TEXT,
  cover_image_url       TEXT,
  thank_you_message     TEXT,
  thank_you_video_url   TEXT,
  pin_enabled           BOOLEAN DEFAULT FALSE,
  pin_code_hash         TEXT,
  package_type          package_type NOT NULL DEFAULT 'eco',
  template_id           TEXT DEFAULT 'classic',
  guest_count_estimate  INT,
  is_upload_active      BOOLEAN DEFAULT TRUE,
  upload_expires_at     TIMESTAMPTZ,
  media_retention_until TIMESTAMPTZ,
  photo_count           INT DEFAULT 0,
  video_count           INT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.media (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id          UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  guest_name        TEXT NOT NULL,
  guest_note        TEXT,
  file_key          TEXT NOT NULL,
  file_url          TEXT NOT NULL,
  file_type         TEXT NOT NULL CHECK (file_type IN ('photo', 'video')),
  file_size         BIGINT,
  original_filename TEXT,
  is_visible        BOOLEAN DEFAULT TRUE,
  uploaded_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- auth.users → profiles otomatik oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- events.updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- photo_count / video_count cache
CREATE OR REPLACE FUNCTION update_event_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.file_type = 'photo' THEN
      UPDATE public.events SET photo_count = photo_count + 1 WHERE id = NEW.event_id;
    ELSE
      UPDATE public.events SET video_count = video_count + 1 WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.file_type = 'photo' THEN
      UPDATE public.events SET photo_count = GREATEST(photo_count - 1, 0) WHERE id = OLD.event_id;
    ELSE
      UPDATE public.events SET video_count = GREATEST(video_count - 1, 0) WHERE id = OLD.event_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_count_trigger
  AFTER INSERT OR DELETE ON public.media
  FOR EACH ROW EXECUTE FUNCTION update_event_media_count();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profile_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profile_update_own"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- EVENTS: host full CRUD
CREATE POLICY "events_host_all"
  ON public.events FOR ALL
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- EVENTS: misafirler slug ile okuyabilir (pin_code_hash API'de filtrelenir)
CREATE POLICY "events_public_read"
  ON public.events FOR SELECT USING (TRUE);

-- MEDIA: host kendi etkinliğini yönetir
CREATE POLICY "media_host_all"
  ON public.media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = media.event_id AND events.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = media.event_id AND events.host_id = auth.uid()
    )
  );

-- MEDIA: herkese görünür medyayı okuma (slayt gösterisi)
CREATE POLICY "media_public_visible_read"
  ON public.media FOR SELECT USING (is_visible = TRUE);
