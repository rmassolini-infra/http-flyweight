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
    const { palantirData } = await req.json();

    if (!palantirData) {
      return new Response(
        JSON.stringify({ error: 'palantirData is required' }),
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

    console.log('Performing Palantir-style intelligence analysis...');

    const prompt = `Você é um analista de inteligência estratégica estilo Palantir Technologies. Analise o vasto conjunto de dados governamentais brasileiros abaixo e forneça insights profundos, correlações não-óbvias e recomendações estratégicas acionáveis.

DADOS AGREGADOS DO PORTAL BRASILEIRO DE DADOS ABERTOS:

**COBERTURA TOTAL:**
- ${palantirData.meta.totalDatasets} datasets únicos coletados
- ${palantirData.meta.categorias} categorias principais
- Coleta realizada em: ${new Date(palantirData.meta.dataColeta).toLocaleString('pt-BR')}

**ECONOMIA & DESENVOLVIMENTO:**
- ${palantirData.economia.total} datasets (PIB, inflação, emprego, renda)
- Principais organizações: IBGE, Ministério da Economia
- Temas: ${palantirData.economia.datasets.slice(0, 3).map((d: any) => d.title.substring(0, 50)).join('; ')}...

**SAÚDE PÚBLICA:**
- ${palantirData.saude.total} datasets (hospitais, SUS, COVID, vacinas)
- Principal fonte: Ministério da Saúde
- Cobertura: Sistema único de saúde, epidemiologia, recursos hospitalares

**EDUCAÇÃO:**
- ${palantirData.educacao.total} datasets (escolas, universidades, ENEM)
- Principal fonte: MEC, INEP
- Foco: Qualidade educacional, acesso, infraestrutura escolar

**SEGURANÇA PÚBLICA:**
- ${palantirData.seguranca.total} datasets (criminalidade, polícia, violência)
- Dados de múltiplas secretarias de segurança
- Indicadores: Taxa de crimes, efetivo policial, ocorrências

**MEIO AMBIENTE:**
- ${palantirData.meioAmbiente.total} datasets (desmatamento, clima, conservação)
- Fontes: IBAMA, ICMBio, INPE
- Monitoramento: Biomas, áreas protegidas, qualidade ambiental

**TRANSPORTES & INFRAESTRUTURA:**
- ${palantirData.transportes.total} datasets (rodovias, ferrovias, aeroportos)
- Fontes: DNIT, ANTT, ANAC
- Cobertura: Malha rodoviária, concessões, mobilidade

**TRABALHO & EMPREGO:**
- ${palantirData.trabalho.total} datasets (CAGED, carteira assinada, mercado)
- Indicadores de emprego formal e informal

**TURISMO:**
- ${palantirData.turismo.total} datasets (fluxo turístico, patrimônio, hotelaria)

---

ANÁLISE PALANTIR - FORNEÇA:

## 1. SÍNTESE EXECUTIVA NACIONAL
(3-4 parágrafos sobre o estado geral do Brasil baseado nos dados agregados)

## 2. CORRELAÇÕES ESTRATÉGICAS CRÍTICAS
Identifique 7-10 correlações NÃO-ÓBVIAS entre diferentes categorias:
- Exemplo: "Regiões com baixo índice educacional (Educação) apresentam 40% mais crimes violentos (Segurança) E menor PIB per capita (Economia)"
- Use números ESPECÍFICOS dos datasets quando possível
- Conecte pelo menos 3 categorias diferentes em cada correlação

## 3. PADRÕES EMERGENTES & TENDÊNCIAS
(5-7 padrões identificados que não são imediatamente visíveis olhando dados isolados)

## 4. ANÁLISE DE RISCO SISTÊMICO
Identifique 4-6 riscos que emergem da análise cruzada:
- Riscos econômicos
- Riscos sociais
- Riscos ambientais
- Riscos de infraestrutura

## 5. OPORTUNIDADES DE ALTO IMPACTO
Liste 6-8 oportunidades onde INTERVENÇÕES COORDENADAS entre múltiplos setores gerariam máximo retorno:
- Seja ESPECÍFICO sobre QUAIS setores, ONDE intervir e QUAL o impacto esperado

## 6. ANOMALIAS & ALERTAS
Identifique 3-5 anomalias que requerem atenção imediata

## 7. RECOMENDAÇÕES ESTRATÉGICAS PRIORITÁRIAS
10 ações TOP prioritárias para gestores públicos, ranqueadas por:
- Impacto potencial (1-10)
- Viabilidade de implementação (1-10)
- Urgência (1-10)

Formato de cada recomendação:
**[Título]** | Impacto: X | Viabilidade: Y | Urgência: Z
Descrição clara em 2-3 linhas sobre a ação e benefícios esperados.

---

DIRETRIZES CRÍTICAS:
- Seja QUANTITATIVO sempre que possível
- Cite FONTES específicas (categorias de dados)
- Identifique CORRELAÇÕES CAUSAIS, não apenas correlações
- Pense como Palantir: conecte pontos que outros não veem
- Seja ACIONÁVEL: todo insight deve levar a uma ação concreta
- Foque em IMPACTO NACIONAL sistêmico`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 8000,
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
    const intelligence = aiData.choices[0].message.content;

    console.log('Palantir-style intelligence analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        intelligence,
        coverage: {
          totalDatasets: palantirData.meta.totalDatasets,
          categorias: palantirData.meta.categorias,
          economia: palantirData.economia.total,
          saude: palantirData.saude.total,
          educacao: palantirData.educacao.total,
          seguranca: palantirData.seguranca.total,
          meioAmbiente: palantirData.meioAmbiente.total,
          transportes: palantirData.transportes.total,
          trabalho: palantirData.trabalho.total,
          turismo: palantirData.turismo.total,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in palantir-intelligence function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
