import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mapaData } = await req.json();

    if (!mapaData) {
      return new Response(
        JSON.stringify({ error: 'mapaData is required' }),
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

    console.log('Analyzing MAPA data with AI...');

    const prompt = `Você é um especialista em agricultura, pecuária e segurança alimentar. Analise os dados do Ministério da Agricultura e Pecuária (MAPA) abaixo e forneça insights estratégicos:

DADOS DO MAPA:

**Agrotóxicos Fitossanitários (Agrofit):**
- Total de registros: ${mapaData.agrotoxicos.total}
- Por classe toxicológica: ${Object.entries(mapaData.agrotoxicos.porClasse).map(([k, v]) => `${k} (${v})`).join(', ')}
- Por cultura: ${Object.entries(mapaData.agrotoxicos.porCultura).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

**Certificação Orgânica:**
- Total de certificados: ${mapaData.certificacaoOrganica.total}
- Área total certificada: ${mapaData.certificacaoOrganica.areaTotalCertificada.toFixed(2)} hectares
- Por estado: ${Object.entries(mapaData.certificacaoOrganica.porEstado).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

**Zoneamento Agrícola de Risco Climático:**
- Total de zonas mapeadas: ${mapaData.zoneamento.total}
- Por cultura: ${Object.entries(mapaData.zoneamento.porCultura).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}
- Por estado: ${Object.entries(mapaData.zoneamento.porEstado).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(', ')}

**Datasets Consultados:**
${mapaData.meta.datasetsConsultados.map((ds: string) => `- ${ds}`).join('\n')}

FORNEÇA:

1. **Resumo Executivo do Setor Agropecuário Brasileiro** (2-3 parágrafos sobre o panorama geral)

2. **Análise de Segurança Alimentar e Sustentabilidade** (avalie o uso de agrotóxicos vs. agricultura orgânica)

3. **Tendências e Oportunidades** (3-5 principais tendências observadas nos dados)

4. **Riscos e Desafios Climáticos** (baseado no zoneamento agrícola)

5. **Recomendações Estratégicas** (3-5 ações para produtores, governo e indústria)

Seja objetivo, técnico e use dados concretos dos números fornecidos. Foque em insights práticos e acionáveis.`;

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
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA insuficientes. Adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const aiData = await response.json();
    const insights = aiData.choices[0].message.content;

    console.log('MAPA AI analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        insights,
        dataAnalyzed: {
          agrotoxicosTotal: mapaData.agrotoxicos.total,
          certificacaoOrganicaTotal: mapaData.certificacaoOrganica.total,
          zoneamentoTotal: mapaData.zoneamento.total,
          areaCertificada: mapaData.certificacaoOrganica.areaTotalCertificada,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in mapa-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
