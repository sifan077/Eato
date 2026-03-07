-- ============================================
-- Meal Logs Table
-- ============================================

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Core fields
  photo_paths TEXT[] NOT NULL,        -- Required: array of photo paths from storage
  content TEXT,                       -- Optional: brief description
  meal_type TEXT NOT NULL,            -- Required: meal type
  eaten_at TIMESTAMPTZ DEFAULT NOW(), -- Default: current time

  -- Optional fields (filled on desktop)
  location TEXT,                      -- Location
  tags TEXT[],                        -- Tags array
  price DECIMAL(10, 2) DEFAULT 0,     -- Price in currency (default 0 means not recorded)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Meal type constraint
  CONSTRAINT check_meal_type
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  CONSTRAINT check_photo_paths_not_empty
    CHECK (array_length(photo_paths, 1) > 0)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Allow users to read their own meal logs
CREATE POLICY "Users can view own meal logs" ON public.meal_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own meal logs
CREATE POLICY "Users can insert own meal logs" ON public.meal_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own meal logs
CREATE POLICY "Users can update own meal logs" ON public.meal_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own meal logs
CREATE POLICY "Users can delete own meal logs" ON public.meal_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_eaten_at ON public.meal_logs(eaten_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_meal_type ON public.meal_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_logs_tags ON public.meal_logs USING GIN(tags);

-- ============================================
-- Storage Bucket for Meal Photos
-- ============================================

-- Note: Storage bucket creation must be done in Supabase Dashboard
-- Bucket name: meal-photos
-- Public: false (only visible to the owner)

-- Storage policies for meal-photos bucket
-- Run these in Supabase Dashboard → Storage → Policies

-- Allow users to upload photos to their own folder
-- Policy name: Users can upload own photos
-- Operation: INSERT
-- Target: bucket_id = 'meal-photos'
-- Using expression: (auth.uid()::text = (storage.foldername(name))[1])

-- Allow users to view their own photos
-- Policy name: Users can view own photos
-- Operation: SELECT
-- Target: bucket_id = 'meal-photos'
-- Using expression: (auth.uid()::text = (storage.foldername(name))[1])

-- Allow users to delete their own photos
-- Policy name: Users can delete own photos
-- Operation: DELETE
-- Target: bucket_id = 'meal-photos'
-- Using expression: (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================
-- Legacy Todos Table (keep for reference)
-- ============================================

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on todos table
CREATE POLICY "Enable all access for all users" ON public.todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- ============================================
-- User Profiles Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Basic Information
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,

  -- Health & Diet Preferences
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  activity_level TEXT,
  diet_goals TEXT[],
  dietary_restrictions TEXT[],
  allergies TEXT[],
  daily_calorie_target INTEGER,

  -- Preferences
  timezone TEXT DEFAULT 'Asia/Shanghai',
  language TEXT DEFAULT 'zh-CN',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_activity_level
    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_diet_goals ON public.user_profiles USING GIN(diet_goals);

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();