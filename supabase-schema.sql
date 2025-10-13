-- Guitar Chord Theory App - Supabase Database Schema
-- This schema migrates data from localStorage to Supabase tables

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for all tables
-- Users can only access their own data

-- ===========================
-- User Profiles Table
-- ===========================
-- Extends Supabase auth.users with additional profile data
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================
-- Chord Lookups Table
-- ===========================
-- Tracks chord search history with usage counts
CREATE TABLE public.chord_lookups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chord_name TEXT NOT NULL,
    chord_type TEXT NOT NULL,
    root_note TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    looked_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chord_lookups ENABLE ROW LEVEL SECURITY;

-- Users can only access their own lookups
CREATE POLICY "Users can manage own chord lookups" ON public.chord_lookups
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_chord_lookups_user_id ON public.chord_lookups(user_id);
CREATE INDEX idx_chord_lookups_looked_up_at ON public.chord_lookups(looked_up_at);
CREATE UNIQUE INDEX idx_chord_lookups_unique ON public.chord_lookups(user_id, chord_name, chord_type);

-- ===========================
-- Favorite Chords Table
-- ===========================
CREATE TABLE public.favorite_chords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chord_name TEXT NOT NULL,
    chord_type TEXT NOT NULL,
    root_note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.favorite_chords ENABLE ROW LEVEL SECURITY;

-- Users can only access their own favorites
CREATE POLICY "Users can manage own favorite chords" ON public.favorite_chords
    FOR ALL USING (auth.uid() = user_id);

-- Indexes and constraints
CREATE INDEX idx_favorite_chords_user_id ON public.favorite_chords(user_id);
CREATE UNIQUE INDEX idx_favorite_chords_unique ON public.favorite_chords(user_id, chord_name, chord_type);

-- ===========================
-- Saved Progressions Table
-- ===========================
CREATE TABLE public.saved_progressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    chords TEXT[] NOT NULL, -- Array of chord names
    tags TEXT[], -- Optional tags for categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_progressions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progressions
CREATE POLICY "Users can manage own saved progressions" ON public.saved_progressions
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_saved_progressions_user_id ON public.saved_progressions(user_id);
CREATE INDEX idx_saved_progressions_created_at ON public.saved_progressions(created_at);

-- ===========================
-- Chord History Table
-- ===========================
-- Recent chord access history (replaces chord-history localStorage)
CREATE TABLE public.chord_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chord TEXT NOT NULL,
    timestamp BIGINT NOT NULL, -- Unix timestamp for compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chord_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own history
CREATE POLICY "Users can manage own chord history" ON public.chord_history
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_chord_history_user_id ON public.chord_history(user_id);
CREATE INDEX idx_chord_history_timestamp ON public.chord_history(timestamp DESC);

-- ===========================
-- User Settings Table
-- ===========================
-- Store user preferences like language, theme, etc.
CREATE TABLE public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'light',
    recent_chord_searches TEXT[], -- Array of recent search terms
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Unique constraint - one settings record per user
CREATE UNIQUE INDEX idx_user_settings_unique ON public.user_settings(user_id);

-- ===========================
-- Functions and Triggers
-- ===========================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chord_lookups_updated_at 
    BEFORE UPDATE ON public.chord_lookups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_progressions_updated_at 
    BEFORE UPDATE ON public.saved_progressions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- Helper Functions
-- ===========================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================
-- Data Migration Functions
-- ===========================

-- Function to clean up old chord lookups (keep last 30 days, max 100 entries per user)
CREATE OR REPLACE FUNCTION cleanup_chord_lookups()
RETURNS VOID AS $$
BEGIN
    -- Delete lookups older than 30 days
    DELETE FROM public.chord_lookups 
    WHERE looked_up_at < NOW() - INTERVAL '30 days';
    
    -- For each user, keep only the most recent 100 lookups
    WITH ranked_lookups AS (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY looked_up_at DESC) as rn
        FROM public.chord_lookups
    )
    DELETE FROM public.chord_lookups 
    WHERE id IN (
        SELECT id FROM ranked_lookups WHERE rn > 100
    );
END;
$$ language 'plpgsql';

-- Function to clean up chord history (keep max 20 entries per user)
CREATE OR REPLACE FUNCTION cleanup_chord_history()
RETURNS VOID AS $$
BEGIN
    WITH ranked_history AS (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC) as rn
        FROM public.chord_history
    )
    DELETE FROM public.chord_history 
    WHERE id IN (
        SELECT id FROM ranked_history WHERE rn > 20
    );
END;
$$ language 'plpgsql';

-- ===========================
-- Real-time Subscriptions Setup
-- ===========================

-- Enable real-time for tables that need live updates
ALTER publication supabase_realtime ADD TABLE public.favorite_chords;
ALTER publication supabase_realtime ADD TABLE public.saved_progressions;
ALTER publication supabase_realtime ADD TABLE public.chord_history;
ALTER publication supabase_realtime ADD TABLE public.user_settings;

-- ===========================
-- Comments for Documentation
-- ===========================

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information beyond Supabase auth';
COMMENT ON TABLE public.chord_lookups IS 'Tracks chord searches with usage counts and timestamps';
COMMENT ON TABLE public.favorite_chords IS 'User favorite chords for quick access';
COMMENT ON TABLE public.saved_progressions IS 'User-created chord progressions with metadata';
COMMENT ON TABLE public.chord_history IS 'Recent chord access history for quick suggestions';
COMMENT ON TABLE public.user_settings IS 'User preferences including language and UI settings';