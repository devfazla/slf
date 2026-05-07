-- SelfDesk Supabase RLS Policies
-- Run these SQL commands in your Supabase SQL Editor
-- Auth uses Supabase email/password (VITE_EMAIL). auth.uid() returns the real user UUID.

-- Enable RLS on all tables
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own app_settings" ON app_settings;
DROP POLICY IF EXISTS "Users can insert own app_settings" ON app_settings;
DROP POLICY IF EXISTS "Users can update own app_settings" ON app_settings;
DROP POLICY IF EXISTS "Users can delete own app_settings" ON app_settings;

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can insert own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

DROP POLICY IF EXISTS "Users can view own theme_presets" ON theme_presets;
DROP POLICY IF EXISTS "Users can insert own theme_presets" ON theme_presets;
DROP POLICY IF EXISTS "Users can update own theme_presets" ON theme_presets;
DROP POLICY IF EXISTS "Users can delete own theme_presets" ON theme_presets;

-- All tables: user_id is text, auth.uid() is UUID - cast auth.uid() to text
CREATE POLICY "Users can view own app_settings" ON app_settings
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own app_settings" ON app_settings
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own app_settings" ON app_settings
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own app_settings" ON app_settings
    FOR DELETE USING (user_id = auth.uid()::text);

-- notes
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (user_id = auth.uid()::text);

-- folders
CREATE POLICY "Users can view own folders" ON folders
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own folders" ON folders
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own folders" ON folders
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own folders" ON folders
    FOR DELETE USING (user_id = auth.uid()::text);

-- files
CREATE POLICY "Users can view own files" ON files
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own files" ON files
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own files" ON files
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own files" ON files
    FOR DELETE USING (user_id = auth.uid()::text);

-- theme_presets
CREATE POLICY "Users can view own theme_presets" ON theme_presets
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own theme_presets" ON theme_presets
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own theme_presets" ON theme_presets
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own theme_presets" ON theme_presets
    FOR DELETE USING (user_id = auth.uid()::text);
