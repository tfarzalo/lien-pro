-- Create the projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see their own projects
CREATE POLICY "Users can see their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own projects
CREATE POLICY "Users can insert their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own projects
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own projects
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
