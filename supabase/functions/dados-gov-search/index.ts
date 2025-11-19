import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nova API REST oficial do Portal Brasileiro de Dados Abertos
const DADOS_GOV_API_BASE = "https://dados.gov.br";
const DADOS_GOV_TOKEN = Deno.env.get('DADOS_GOV_API_TOKEN');

async function fetchFromAPI(url: string): Promise<Response> {
  console.log(`Buscando dados de: ${url}`);
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; DataAggregator/1.0)',
  };
  
  if (DADOS_GOV_TOKEN) {
    headers['Authorization'] = `Bearer ${DADOS_GOV_TOKEN}`;
  }
  
  const response = await fetch(url, { 
    headers,
    redirect: 'follow',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erro na API: ${response.status} - ${errorText}`);
    throw new Error(`API error: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error(`Content-Type inválido: ${contentType}`);
    throw new Error(`Invalid content-type: ${contentType}`);
  }
  
  return response;
}

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

    // Buscar da nova API REST
    console.log('Cache miss, buscando da nova API REST...');
    
    let url: string;
    const params = new URLSearchParams();
    params.set('size', rows.toString());
    params.set('page', '0');
    
    if (type === 'category') {
      params.set('palavraChave', query);
      url = `${DADOS_GOV_API_BASE}/dados/api/publico/conjuntos-dados?${params.toString()}`;
    } else if (type === 'organization') {
      params.set('organizacao', org);
      url = `${DADOS_GOV_API_BASE}/dados/api/publico/conjuntos-dados?${params.toString()}`;
    } else {
      throw new Error('Invalid search type');
    }

    const response = await fetchFromAPI(url);
    const data = await response.json();
    
    // A nova API retorna dados em formato diferente
    const results = data.content || [];
    console.log(`Encontrados ${results.length} datasets da nova API`);

    const datasets = results.map((ds: any) => ({
      id: ds.id,
      title: ds.titulo || ds.title,
      organization: ds.organizacao?.nome || ds.organization?.title || "N/A",
      resources: ds.recursos?.length || ds.resources?.length || 0,
      tags: ds.tags?.map((t: any) => typeof t === 'string' ? t : t.nome || t.name) || [],
      metadata_modified: ds.dataModificacao || ds.metadata_modified || "",
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
