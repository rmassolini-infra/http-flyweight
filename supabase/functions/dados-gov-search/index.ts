import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DADOS_GOV_BASE = "https://dados.gov.br/api/3/action";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { type, query, org, rows = 100, useCache = true } = await req.json();
    
    console.log(`Buscando ${type}: ${query || org} (rows: ${rows}, cache: ${useCache})`);

    // Tentar buscar do cache primeiro
    if (useCache) {
      let dbQuery = supabase
        .from('dadosgov_datasets')
        .select('id, title, organization_title, num_resources, tags, metadata_modified');

      if (type === 'category') {
        // Buscar por título ou tags que contenham as palavras-chave
        const keywords = query.split(' OR ').map((k: string) => k.trim().toLowerCase());
        const titleConditions = keywords.map((k: string) => `title.ilike.%${k}%`).join(',');
        dbQuery = dbQuery.or(titleConditions);
      } else if (type === 'organization') {
        dbQuery = dbQuery.eq('organization_name', org);
      }

      const { data: cachedData, error } = await dbQuery.limit(rows);

      if (!error && cachedData && cachedData.length > 0) {
        console.log(`Retornando ${cachedData.length} datasets do cache`);
        
        const datasets = cachedData.map((ds: any) => ({
          id: ds.id,
          title: ds.title,
          organization: ds.organization_title || "N/A",
          resources: ds.num_resources || 0,
          tags: Array.isArray(ds.tags) ? ds.tags.map((t: any) => t.name || t) : [],
          metadata_modified: ds.metadata_modified || "",
        }));

        return new Response(
          JSON.stringify({ success: true, results: datasets, fromCache: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Se não encontrou no cache ou cache desabilitado, buscar da API
    console.log('Cache miss, buscando da API...');
    
    let url: string;
    if (type === 'category') {
      url = `${DADOS_GOV_BASE}/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    } else if (type === 'organization') {
      url = `${DADOS_GOV_BASE}/package_search?fq=organization:${encodeURIComponent(org)}&rows=${rows}`;
    } else {
      throw new Error('Invalid search type');
    }

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          results: [],
          error: `API returned ${response.status}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const results = data.result?.results || [];
    
    console.log(`Encontrados ${results.length} datasets da API`);

    const datasets = results.map((ds: any) => ({
      id: ds.id,
      title: ds.title,
      organization: ds.organization?.title || "N/A",
      resources: ds.resources?.length || 0,
      tags: ds.tags?.map((t: any) => t.name) || [],
      metadata_modified: ds.metadata_modified || "",
    }));

    return new Response(
      JSON.stringify({ success: true, results: datasets, fromCache: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dados-gov-search:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
