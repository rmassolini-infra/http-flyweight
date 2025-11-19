import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_URL = "https://api.lovable.app/v1/ai/generate";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando análise de inteligência profunda dos dados gov.br...');

    // 1. Buscar TODOS os datasets do cache
    const { data: allDatasets, error: dbError } = await supabase
      .from('dadosgov_datasets')
      .select('*')
      .order('metadata_modified', { ascending: false })
      .limit(1000);

    if (dbError) {
      throw new Error(`Erro ao buscar datasets: ${dbError.message}`);
    }

    console.log(`Datasets encontrados: ${allDatasets?.length || 0}`);

    // 2. Agrupar por organização e categoria
    const byOrganization: Record<string, any[]> = {};
    const byTags: Record<string, any[]> = {};
    
    allDatasets?.forEach(ds => {
      const org = ds.organization_title || 'Sem Organização';
      if (!byOrganization[org]) byOrganization[org] = [];
      byOrganization[org].push(ds);

      if (Array.isArray(ds.tags)) {
        ds.tags.forEach((tag: any) => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          if (tagName) {
            if (!byTags[tagName]) byTags[tagName] = [];
            byTags[tagName].push(ds);
          }
        });
      }
    });

    // 3. Estatísticas gerais
    const stats = {
      totalDatasets: allDatasets?.length || 0,
      totalOrganizations: Object.keys(byOrganization).length,
      totalTags: Object.keys(byTags).length,
      topOrganizations: Object.entries(byOrganization)
        .map(([org, datasets]) => ({ org, count: datasets.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topTags: Object.entries(byTags)
        .map(([tag, datasets]) => ({ tag, count: datasets.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      datasetsWithResources: allDatasets?.filter(ds => (ds.num_resources || 0) > 0).length || 0,
      avgResourcesPerDataset: allDatasets?.length 
        ? (allDatasets.reduce((sum, ds) => sum + (ds.num_resources || 0), 0) / allDatasets.length).toFixed(2)
        : 0,
    };

    // 4. Preparar contexto para IA
    const contextForAI = {
      stats,
      sampleDatasets: allDatasets?.slice(0, 50).map(ds => ({
        title: ds.title,
        organization: ds.organization_title,
        tags: ds.tags,
        resources: ds.num_resources,
        notes: ds.notes?.substring(0, 200),
      })),
      topOrganizations: stats.topOrganizations,
      topTags: stats.topTags,
    };

    console.log('Enviando dados para análise de IA...');

    // 5. Usar IA do Lovable para análise profunda
    const aiPrompt = `
Você é um analista de dados governamental especializado. Analise profundamente os seguintes dados do Portal Brasileiro de Dados Abertos:

ESTATÍSTICAS GERAIS:
- Total de datasets: ${stats.totalDatasets}
- Total de organizações: ${stats.totalOrganizations}
- Datasets com recursos: ${stats.datasetsWithResources}
- Média de recursos por dataset: ${stats.avgResourcesPerDataset}

TOP 10 ORGANIZAÇÕES:
${stats.topOrganizations.map(o => `- ${o.org}: ${o.count} datasets`).join('\n')}

TOP 20 TAGS/CATEGORIAS:
${stats.topTags.map(t => `- ${t.tag}: ${t.count} datasets`).join('\n')}

AMOSTRA DE DATASETS:
${JSON.stringify(contextForAI.sampleDatasets, null, 2)}

GERE UMA ANÁLISE PROFUNDA que inclua:

1. **TENDÊNCIAS IDENTIFICADAS**: Quais são as principais áreas de foco do governo brasileiro em termos de abertura de dados?

2. **LACUNAS DE DADOS**: Quais áreas importantes parecem ter menos dados disponíveis?

3. **QUALIDADE DOS DADOS**: Avalie a qualidade com base em número de recursos, atualização e documentação.

4. **OPORTUNIDADES**: Quais datasets ou combinações de datasets oferecem maior potencial para análises e aplicações?

5. **RECOMENDAÇÕES ESTRATÉGICAS**: Para empresas, pesquisadores e desenvolvedores que queiram aproveitar esses dados.

6. **INSIGHTS ACIONÁVEIS**: Pelo menos 5 insights concretos e acionáveis baseados nos dados.

7. **CORRELAÇÕES INTERESSANTES**: Identifique possíveis correlações entre diferentes categorias de dados.

Responda em formato JSON estruturado com as seguintes chaves:
{
  "tendencias": [{"titulo": "...", "descricao": "...", "impacto": "alto|medio|baixo"}],
  "lacunas": [{"area": "...", "descricao": "...", "prioridade": "alta|media|baixa"}],
  "qualidade": {"score": 0-100, "analise": "...", "pontosFracos": [], "pontosFortes": []},
  "oportunidades": [{"titulo": "...", "descricao": "...", "datasets_relacionados": [], "potencial": "alto|medio|baixo"}],
  "recomendacoes": {"empresas": [], "pesquisadores": [], "desenvolvedores": []},
  "insights": [{"titulo": "...", "descricao": "...", "acao_sugerida": "..."}],
  "correlacoes": [{"area1": "...", "area2": "...", "relacao": "...", "potencial_analise": "..."}],
  "resumo_executivo": "..."
}
`;

    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na API Lovable AI:', errorText);
      throw new Error(`Erro na API Lovable AI: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    console.log('Análise de IA concluída');

    // Parse do JSON da resposta da IA
    let aiAnalysis;
    try {
      const content = aiResult.choices?.[0]?.message?.content || aiResult.content || '';
      // Tentar extrair JSON do conteúdo
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        aiAnalysis = { raw_response: content };
      }
    } catch (parseError) {
      console.warn('Erro ao parsear resposta da IA:', parseError);
      aiAnalysis = { 
        raw_response: aiResult.choices?.[0]?.message?.content || aiResult.content || 'Erro ao processar resposta' 
      };
    }

    // 6. Consolidar resposta final
    const finalAnalysis = {
      metadata: {
        timestamp: new Date().toISOString(),
        total_datasets_analyzed: stats.totalDatasets,
        total_organizations: stats.totalOrganizations,
        total_categories: stats.totalTags,
        analysis_model: 'google/gemini-2.5-pro',
      },
      statistics: stats,
      organizations: {
        top10: stats.topOrganizations,
        total: Object.keys(byOrganization).length,
        distribution: Object.entries(byOrganization).map(([org, datasets]) => ({
          name: org,
          datasets: datasets.length,
          avgResources: datasets.reduce((sum, ds) => sum + (ds.num_resources || 0), 0) / datasets.length,
        })).sort((a, b) => b.datasets - a.datasets).slice(0, 20),
      },
      categories: {
        top20: stats.topTags,
        total: Object.keys(byTags).length,
        distribution: Object.entries(byTags).map(([tag, datasets]) => ({
          tag,
          datasets: datasets.length,
        })).sort((a, b) => b.datasets - a.datasets).slice(0, 30),
      },
      ai_analysis: aiAnalysis,
      sample_datasets: allDatasets?.slice(0, 100).map(ds => ({
        id: ds.id,
        title: ds.title,
        organization: ds.organization_title,
        tags: ds.tags,
        resources: ds.num_resources,
        last_modified: ds.metadata_modified,
      })),
    };

    console.log('Análise profunda concluída com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: finalAnalysis 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in deep-intelligence:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
