-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chord_lookups table for auto-saving looked up chords
CREATE TABLE IF NOT EXISTS public.chord_lookups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chord_name TEXT NOT NULL,
  chord_data JSONB NOT NULL,
  looked_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lookup_count INTEGER DEFAULT 1
);

-- Create favorite_chords table
CREATE TABLE IF NOT EXISTS public.favorite_chords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chord_name TEXT NOT NULL,
  chord_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chord_name)
);

-- Create chord_progressions table
CREATE TABLE IF NOT EXISTS public.chord_progressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  chords JSONB NOT NULL, -- Array of chord objects
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chord_lookups_user_id ON chord_lookups(user_id);
CREATE INDEX IF NOT EXISTS idx_chord_lookups_looked_up_at ON chord_lookups(looked_up_at);
CREATE INDEX IF NOT EXISTS idx_favorite_chords_user_id ON favorite_chords(user_id);
CREATE INDEX IF NOT EXISTS idx_chord_progressions_user_id ON chord_progressions(user_id);
CREATE INDEX IF NOT EXISTS idx_chord_progressions_tags ON chord_progressions USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_lookups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_chords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_progressions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Chord lookups
CREATE POLICY "Users can view own chord lookups" ON public.chord_lookups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chord lookups" ON public.chord_lookups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chord lookups" ON public.chord_lookups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chord lookups" ON public.chord_lookups
  FOR DELETE USING (auth.uid() = user_id);

-- Favorite chords
CREATE POLICY "Users can view own favorite chords" ON public.favorite_chords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite chords" ON public.favorite_chords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorite chords" ON public.favorite_chords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite chords" ON public.favorite_chords
  FOR DELETE USING (auth.uid() = user_id);

-- Chord progressions
CREATE POLICY "Users can view own chord progressions" ON public.chord_progressions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public chord progressions" ON public.chord_progressions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own chord progressions" ON public.chord_progressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chord progressions" ON public.chord_progressions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chord progressions" ON public.chord_progressions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up old chord lookups (keep only last month)
CREATE OR REPLACE FUNCTION public.cleanup_old_chord_lookups()
RETURNS void AS $$
BEGIN
  DELETE FROM public.chord_lookups 
  WHERE looked_up_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
