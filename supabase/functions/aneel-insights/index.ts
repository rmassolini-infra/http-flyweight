import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AneelData {
  geracaoDistribuida: any;
  transmissao: any;
  geracao: any;
  tarifas: any;
  ouvidoria: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aneelData } = await req.json();

    if (!aneelData) {
      return new Response(
        JSON.stringify({ error: 'aneelData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing ANEEL data with AI...');

    const prompt = `Você é um especialista em análise do setor elétrico brasileiro. Analise os dados da ANEEL abaixo e forneça insights estratégicos:

DADOS DA ANEEL:

**Geração Distribuída (Micro e Minigeração):**
- Total de empreendimentos: ${aneelData.geracaoDistribuida.total}
- Potência total instalada: ${(aneelData.geracaoDistribuida.potenciaTotal / 1000).toFixed(2)} MW
- Principais fontes: ${Object.entries(aneelData.geracaoDistribuida.porFonte).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}
- Estados líderes: ${Object.entries(aneelData.geracaoDistribuida.porEstado).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

**Geração Centralizada (SIGA):**
- Total de usinas: ${aneelData.geracao.total}
- Potência fiscalizada: ${aneelData.geracao.potenciaTotal.toFixed(2)} MW
- Principais fontes: ${Object.entries(aneelData.geracao.porFonte).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}
- Situação operacional: ${Object.entries(aneelData.geracao.porSituacao).map(([k, v]) => `${k} (${v})`).join(', ')}

**Transmissão:**
- Total de linhas: ${aneelData.transmissao.total}
- Extensão total: ${aneelData.transmissao.extensaoTotal.toFixed(2)} km
- Principais concessionárias: ${Object.entries(aneelData.transmissao.porConcessionaria).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

**Tarifas:**
- Tarifa média nacional: R$ ${aneelData.tarifas.mediaNacional.toFixed(4)}/kWh
- Total de modalidades: ${aneelData.tarifas.total}

**Ouvidoria:**
- Total de demandas: ${aneelData.ouvidoria.total}
- Principais assuntos: ${Object.entries(aneelData.ouvidoria.porAssunto).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

FORNEÇA:
1. **Resumo Executivo** (2-3 parágrafos sobre o panorama geral do setor elétrico brasileiro)
2. **Tendências Identificadas** (3-5 principais tendências observadas nos dados)
3. **Oportunidades** (3-5 oportunidades de investimento ou desenvolvimento)
4. **Desafios** (3-5 principais desafios identificados)
5. **Recomendações Estratégicas** (3-5 ações recomendadas para stakeholders do setor)

Seja objetivo, técnico e use dados concretos dos números fornecidos.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const aiData = await response.json();
    const insights = aiData.choices[0].message.content;

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        insights,
        dataAnalyzed: {
          geracaoDistribuidaTotal: aneelData.geracaoDistribuida.total,
          geracaoTotal: aneelData.geracao.total,
          transmissaoTotal: aneelData.transmissao.total,
          ouvidoriaTotal: aneelData.ouvidoria.total,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in aneel-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
