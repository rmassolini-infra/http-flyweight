import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, query, rows } = await req.json();
    
    console.log(`Buscando dados.gov.br - tipo: ${type}, query: ${query}, rows: ${rows}`);

    let url: string;
    if (type === 'category') {
      url = `${DADOS_GOV_BASE}/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    } else if (type === 'organization') {
      url = `${DADOS_GOV_BASE}/package_search?fq=organization:${encodeURIComponent(query)}&rows=${rows}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Use "category" or "organization"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Erro ao buscar: ${response.status}`);
      return new Response(
        JSON.stringify({ success: false, result: { results: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    console.log(`Encontrados ${data.result?.results?.length || 0} datasets`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in dados-gov-proxy function:', error);
    return new Response(
      JSON.stringify({ success: false, result: { results: [] }, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
