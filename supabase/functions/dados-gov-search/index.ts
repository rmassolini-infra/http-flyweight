import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL correta da API CKAN do Portal Brasileiro de Dados Abertos
const DADOS_GOV_ENDPOINTS = [
  "https://legado.dados.gov.br/api/3/action",
  "https://dados.gov.br/api/3/action",
];

async function fetchWithFallback(path: string, options: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  for (const baseUrl of DADOS_GOV_ENDPOINTS) {
    try {
      const url = `${baseUrl}${path}`;
      console.log(`Tentando endpoint: ${url}`);
      
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      
      console.log(`Endpoint ${baseUrl} - Status: ${response.status}, Content-Type: ${contentType}`);
      
      // Verificar se a resposta é JSON válida
      if (response.ok && contentType && contentType.includes('application/json')) {
        console.log(`✓ Sucesso com endpoint: ${baseUrl}`);
        return response;
      }
      
      if (!response.ok) {
        console.warn(`Endpoint ${baseUrl} retornou status ${response.status}`);
        continue;
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Endpoint ${baseUrl} retornou content-type inválido: ${contentType}`);
        continue;
      }
    } catch (error) {
      console.error(`Erro ao tentar endpoint ${baseUrl}:`, error);
      lastError = error as Error;
    }
  }
  
  throw lastError || new Error('Todos os endpoints falharam');
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
    
    let path: string;
    if (type === 'category') {
      path = `/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    } else if (type === 'organization') {
      path = `/package_search?fq=organization:${encodeURIComponent(org)}&rows=${rows}`;
    } else {
      throw new Error('Invalid search type');
    }

    const response = await fetchWithFallback(path, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DataAggregator/1.0)',
      },
    });

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
