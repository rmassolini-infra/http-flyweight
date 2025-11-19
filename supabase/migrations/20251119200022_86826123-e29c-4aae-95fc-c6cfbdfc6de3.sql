-- Create table for storing dados.gov.br datasets
CREATE TABLE IF NOT EXISTS public.dadosgov_datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  organization_id TEXT,
  organization_name TEXT,
  organization_title TEXT,
  author TEXT,
  author_email TEXT,
  maintainer TEXT,
  maintainer_email TEXT,
  license_id TEXT,
  license_title TEXT,
  metadata_created TIMESTAMP WITH TIME ZONE,
  metadata_modified TIMESTAMP WITH TIME ZONE,
  num_resources INTEGER DEFAULT 0,
  num_tags INTEGER DEFAULT 0,
  resources JSONB,
  tags JSONB,
  groups JSONB,
  extras JSONB,
  url TEXT,
  state TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_dadosgov_datasets_title ON public.dadosgov_datasets USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_dadosgov_datasets_notes ON public.dadosgov_datasets USING gin(to_tsvector('portuguese', notes));
CREATE INDEX IF NOT EXISTS idx_dadosgov_datasets_organization ON public.dadosgov_datasets(organization_name);
CREATE INDEX IF NOT EXISTS idx_dadosgov_datasets_metadata_modified ON public.dadosgov_datasets(metadata_modified DESC);
CREATE INDEX IF NOT EXISTS idx_dadosgov_datasets_state ON public.dadosgov_datasets(state);

-- Enable Row Level Security
ALTER TABLE public.dadosgov_datasets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (datasets are public data)
CREATE POLICY "Allow public read access to datasets"
  ON public.dadosgov_datasets
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update from service role only
CREATE POLICY "Allow service role to manage datasets"
  ON public.dadosgov_datasets
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create metadata table to track sync status
CREATE TABLE IF NOT EXISTS public.dadosgov_sync_metadata (
  id SERIAL PRIMARY KEY,
  total_datasets INTEGER,
  synced_datasets INTEGER,
  last_sync_started TIMESTAMP WITH TIME ZONE,
  last_sync_completed TIMESTAMP WITH TIME ZONE,
  sync_status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for sync metadata
ALTER TABLE public.dadosgov_sync_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sync metadata
CREATE POLICY "Allow public read access to sync metadata"
  ON public.dadosgov_sync_metadata
  FOR SELECT
  USING (true);

-- Allow service role to manage sync metadata
CREATE POLICY "Allow service role to manage sync metadata"
  ON public.dadosgov_sync_metadata
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_dadosgov_datasets_updated_at
  BEFORE UPDATE ON public.dadosgov_datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dadosgov_sync_metadata_updated_at
  BEFORE UPDATE ON public.dadosgov_sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();