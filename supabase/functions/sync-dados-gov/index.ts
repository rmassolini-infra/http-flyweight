import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nova API REST oficial do Portal Brasileiro de Dados Abertos
const DADOS_GOV_API_BASE = "https://dados.gov.br";
const DADOS_GOV_TOKEN = Deno.env.get('DADOS_GOV_API_TOKEN');

async function fetchFromAPI(url: string): Promise<Response | null> {
  try {
    console.log(`Sync - Buscando dados de: ${url}`);
    
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
      console.error(`Sync - Erro na API: ${response.status} - ${errorText}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Sync - Content-Type inválido: ${contentType}`);
      return null;
    }
    
    console.log(`Sync - ✓ Sucesso: ${response.status}`);
    return response;
  } catch (error) {
    console.error('Sync - Erro ao buscar dados:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { categories, organizations, forceSync = false } = await req.json();

    // Verificar última sincronização
    const { data: lastSync } = await supabase
      .from('dadosgov_sync_metadata')
      .select('*')
      .order('last_sync_completed', { ascending: false })
      .limit(1)
      .maybeSingle();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needsSync = forceSync || !lastSync || 
      !lastSync.last_sync_completed || 
      new Date(lastSync.last_sync_completed) < oneDayAgo;

    if (!needsSync) {
      console.log('Cache ainda válido, usando dados existentes');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cache válido',
          useCache: true,
          lastSync: lastSync.last_sync_completed 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Iniciar nova sincronização
    const { data: syncMetadata } = await supabase
      .from('dadosgov_sync_metadata')
      .insert({
        sync_status: 'running',
        last_sync_started: new Date().toISOString(),
        total_datasets: 0,
        synced_datasets: 0,
      })
      .select()
      .single();

    const syncPromise = syncDatasets(supabase, syncMetadata.id, categories, organizations);
    
    // Executar sincronização em background
    syncPromise.catch(err => console.error('Background sync error:', err));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sincronização iniciada',
        syncId: syncMetadata.id,
        useCache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-dados-gov:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncDatasets(
  supabase: any,
  syncId: number,
  categories: Array<{ query: string, rows: number }>,
  organizations: Array<{ org: string, rows: number }>
) {
  try {
    console.log('Iniciando sincronização de datasets...');
    let totalSynced = 0;

    // Buscar por categorias
    for (const cat of categories) {
      const datasets = await fetchDatasets('category', cat.query, cat.rows);
      if (datasets.length > 0) {
        await upsertDatasets(supabase, datasets);
        totalSynced += datasets.length;
      }
    }

    // Buscar por organizações
    for (const org of organizations) {
      const datasets = await fetchDatasets('organization', org.org, org.rows);
      if (datasets.length > 0) {
        await upsertDatasets(supabase, datasets);
        totalSynced += datasets.length;
      }
    }

    // Atualizar metadata de sincronização
    await supabase
      .from('dadosgov_sync_metadata')
      .update({
        sync_status: 'completed',
        last_sync_completed: new Date().toISOString(),
        synced_datasets: totalSynced,
        total_datasets: totalSynced,
      })
      .eq('id', syncId);

    console.log(`Sincronização concluída: ${totalSynced} datasets`);
  } catch (error) {
    console.error('Erro na sincronização:', error);
    
    await supabase
      .from('dadosgov_sync_metadata')
      .update({
        sync_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', syncId);
  }
}

async function fetchDatasets(type: string, query: string, rows: number): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    params.set('size', rows.toString());
    params.set('page', '0');
    
    let url: string;
    if (type === 'category') {
      params.set('palavraChave', query);
      url = `${DADOS_GOV_API_BASE}/dados/api/publico/conjuntos-dados?${params.toString()}`;
    } else {
      params.set('organizacao', query);
      url = `${DADOS_GOV_API_BASE}/dados/api/publico/conjuntos-dados?${params.toString()}`;
    }

    const response = await fetchFromAPI(url);

    if (!response) {
      console.error(`Falha ao buscar ${type}: ${query}`);
      return [];
    }

    const data = await response.json();
    const results = data.content || [];
    
    // Converter para o formato esperado pelo upsert
    return results.map((ds: any) => ({
      id: ds.id,
      name: ds.nome || ds.name || ds.id,
      title: ds.titulo || ds.title,
      notes: ds.descricao || ds.notes,
      organization: {
        id: ds.organizacao?.id,
        name: ds.organizacao?.sigla,
        title: ds.organizacao?.nome,
      },
      resources: ds.recursos || ds.resources || [],
      tags: ds.tags || [],
      metadata_created: ds.dataCriacao || ds.metadata_created,
      metadata_modified: ds.dataModificacao || ds.metadata_modified,
    }));
  } catch (error) {
    console.error(`Erro ao buscar ${type}: ${query}`, error);
    return [];
  }
}

async function upsertDatasets(supabase: any, datasets: any[]) {
  const formatted = datasets.map((ds: any) => ({
    id: ds.id,
    name: ds.name,
    title: ds.title,
    notes: ds.notes,
    organization_id: ds.organization?.id,
    organization_name: ds.organization?.name,
    organization_title: ds.organization?.title,
    author: ds.author,
    author_email: ds.author_email,
    maintainer: ds.maintainer,
    maintainer_email: ds.maintainer_email,
    license_id: ds.license_id,
    license_title: ds.license_title,
    state: ds.state,
    type: ds.type,
    url: ds.url,
    metadata_created: ds.metadata_created,
    metadata_modified: ds.metadata_modified,
    num_resources: ds.resources?.length || 0,
    num_tags: ds.tags?.length || 0,
    resources: ds.resources || [],
    tags: ds.tags || [],
    groups: ds.groups || [],
    extras: ds.extras || [],
  }));

  // Upsert em lotes de 100
  for (let i = 0; i < formatted.length; i += 100) {
    const batch = formatted.slice(i, i + 100);
    await supabase
      .from('dadosgov_datasets')
      .upsert(batch, { onConflict: 'id' });
  }
}
