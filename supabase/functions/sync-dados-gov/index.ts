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
      const datasets = await fetchFromAPI('category', cat.query, cat.rows);
      if (datasets.length > 0) {
        await upsertDatasets(supabase, datasets);
        totalSynced += datasets.length;
      }
    }

    // Buscar por organizações
    for (const org of organizations) {
      const datasets = await fetchFromAPI('organization', org.org, org.rows);
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

async function fetchFromAPI(type: string, query: string, rows: number): Promise<any[]> {
  try {
    let url: string;
    if (type === 'category') {
      url = `${DADOS_GOV_BASE}/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    } else {
      url = `${DADOS_GOV_BASE}/package_search?fq=organization:${encodeURIComponent(query)}&rows=${rows}`;
    }

    console.log(`Sync - Fetching ${type}: ${query} from ${url}`);
    
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DataAggregator/1.0)',
      },
    });

    console.log(`Sync - Response status for ${query}: ${response.status}, content-type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      console.error(`API Error for ${type} ${query}: ${response.status}`);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`Invalid content type for ${type} ${query}: ${contentType}`);
      console.error(`Response preview: ${responseText.substring(0, 200)}`);
      return [];
    }

    const data = await response.json();
    return data.result?.results || [];
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
