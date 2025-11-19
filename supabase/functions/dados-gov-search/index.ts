import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { type, query, org, rows = 100 } = await req.json();
    
    console.log(`Buscando ${type}: ${query || org} (rows: ${rows})`);

    let url: string;
    if (type === 'category') {
      url = `${DADOS_GOV_BASE}/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    } else if (type === 'organization') {
      url = `${DADOS_GOV_BASE}/package_search?fq=organization:${encodeURIComponent(org)}&rows=${rows}`;
    } else {
      throw new Error('Invalid search type');
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
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
    
    console.log(`Encontrados ${results.length} datasets`);

    const datasets = results.map((ds: any) => ({
      id: ds.id,
      title: ds.title,
      organization: ds.organization?.title || "N/A",
      resources: ds.resources?.length || 0,
      tags: ds.tags?.map((t: any) => t.name) || [],
      metadata_modified: ds.metadata_modified || "",
    }));

    return new Response(
      JSON.stringify({ success: true, results: datasets }),
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
