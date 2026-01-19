-- Enable vector extension for semantic tool search
CREATE EXTENSION IF NOT EXISTS vector;

-- System Logs table (The War Room Feed)
CREATE TABLE public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  type TEXT CHECK (type IN ('info', 'healing', 'error', 'success')) NOT NULL,
  message TEXT NOT NULL,
  tool_name TEXT,
  backup_tool TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tool Registry table with vector embeddings for semantic search
CREATE TABLE public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  endpoint TEXT,
  fallback_tools TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Public read access for system_logs (for War Room display)
CREATE POLICY "Anyone can view system logs"
  ON public.system_logs FOR SELECT
  USING (true);

-- Anyone can insert system logs (from edge functions)
CREATE POLICY "Anyone can insert system logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (true);

-- Public read access for tools
CREATE POLICY "Anyone can view tools"
  ON public.tools FOR SELECT
  USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;

-- Insert initial tool registry with fallback chains
INSERT INTO public.tools (name, category, description, endpoint, fallback_tools, priority) VALUES
  ('amadeus_flights', 'travel', 'Search real-time flight offers using Amadeus API', 'flight-search', ARRAY['serpapi_flights', 'mock_flights'], 1),
  ('serpapi_flights', 'travel', 'Search flights using SerpApi Google Flights', 'flight-search-serpapi', ARRAY['mock_flights'], 2),
  ('mock_flights', 'travel', 'Return mock flight data for demo purposes', 'flight-search-mock', ARRAY[]::TEXT[], 3),
  ('amadeus_hotels', 'travel', 'Search hotels using Amadeus API', 'hotel-search', ARRAY['mock_hotels'], 1),
  ('mock_hotels', 'travel', 'Return mock hotel data for demo purposes', 'hotel-search-mock', ARRAY[]::TEXT[], 2),
  ('weather_api', 'utility', 'Get weather information for destinations', 'weather', ARRAY['mock_weather'], 1),
  ('mock_weather', 'utility', 'Return mock weather data', 'weather-mock', ARRAY[]::TEXT[], 2);

-- Create function to find similar tools using vector similarity
CREATE OR REPLACE FUNCTION public.match_tools(
  query_category TEXT,
  failed_tool TEXT,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  description TEXT,
  endpoint TEXT,
  priority INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.category,
    t.description,
    t.endpoint,
    t.priority
  FROM public.tools t
  WHERE t.category = query_category
    AND t.name != failed_tool
    AND t.is_active = true
  ORDER BY t.priority ASC
  LIMIT match_count;
END;
$$;