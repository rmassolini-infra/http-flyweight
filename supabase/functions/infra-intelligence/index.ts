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
    const { infraData } = await req.json();

    if (!infraData) {
      return new Response(
        JSON.stringify({ error: 'infraData is required' }),
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

    console.log('Performing infrastructure intelligence analysis...');

    const prompt = `Você é um analista de inteligência estratégica de infraestrutura. Analise o vasto conjunto de dados governamentais brasileiros abaixo e forneça insights profundos, correlações não-óbvias e recomendações estratégicas acionáveis.

DADOS AGREGADOS DO PORTAL BRASILEIRO DE DADOS ABERTOS:

**COBERTURA TOTAL:**
- ${infraData.meta.totalDatasets} datasets únicos coletados
- ${infraData.meta.categorias} categorias principais
- Coleta realizada em: ${new Date(infraData.meta.dataColeta).toLocaleString('pt-BR')}

**ECONOMIA & DESENVOLVIMENTO:**
- ${infraData.economia.total} datasets (PIB, inflação, emprego, renda)
- Principais organizações: IBGE, Ministério da Economia
- Temas: ${infraData.economia.datasets.slice(0, 3).map((d: any) => d.title.substring(0, 50)).join('; ')}...

**SAÚDE PÚBLICA:**
- ${infraData.saude.total} datasets (hospitais, SUS, COVID, vacinas)
- Principal fonte: Ministério da Saúde
- Cobertura: Sistema único de saúde, epidemiologia, recursos hospitalares

**EDUCAÇÃO:**
- ${infraData.educacao.total} datasets (escolas, universidades, ENEM)
- Principal fonte: MEC, INEP
- Foco: Qualidade educacional, acesso, infraestrutura escolar

**SEGURANÇA PÚBLICA:**
- ${infraData.seguranca.total} datasets (criminalidade, polícia, violência)
- Dados de múltiplas secretarias de segurança
- Indicadores: Taxa de crimes, efetivo policial, ocorrências

**MEIO AMBIENTE:**
- ${infraData.meioAmbiente.total} datasets (desmatamento, clima, conservação)
- Fontes: IBAMA, ICMBio, INPE
- Monitoramento: Biomas, áreas protegidas, qualidade ambiental

**TRANSPORTES & INFRAESTRUTURA:**
- ${infraData.transportes.total} datasets (rodovias, ferrovias, aeroportos)
- Fontes: DNIT, ANTT, ANAC
- Cobertura: Malha rodoviária, concessões, mobilidade

**TRABALHO & EMPREGO:**
- ${infraData.trabalho.total} datasets (CAGED, carteira assinada, mercado)
- Indicadores de emprego formal e informal

**TURISMO:**
- ${infraData.turismo.total} datasets (fluxo turístico, patrimônio, hotelaria)

---

ANÁLISE DE INTELIGÊNCIA - FORNEÇA:

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
6-8 oportunidades concretas que surgem da análise cross-category:
- Devem ser específicas, mensuráveis, acionáveis
- Priorize oportunidades que conectem 3+ categorias
- Indique impacto esperado e stakeholders envolvidos

## 6. ANOMALIAS & ALERTAS
3-5 anomalias ou padrões preocupantes que requerem atenção imediata

## 7. RECOMENDAÇÕES PRIORIZADAS
Top 5 recomendações URGENTES e ACIONÁVEIS para o governo federal:
- Ordene por impacto × viabilidade
- Para cada uma: ação, justificativa, prazo, stakeholders, custo estimado

**IMPORTANTE:**
- Seja ESPECÍFICO com números e datasets reais
- Conecte categorias diferentes para insights profundos
- Mantenha tom analítico e objetivo
- Foque em AÇÕES concretas, não apenas observações

Formate a resposta em Markdown com cabeçalhos, listas e ênfase apropriada.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: 'Você é um analista de inteligência estratégica especializado em análise de dados governamentais abertos.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taxa excedido. Por favor, tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao processar análise de inteligência' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const intelligence = data.choices[0]?.message?.content || 'Nenhuma análise gerada';

    console.log('Infrastructure intelligence analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        intelligence,
        coverage: {
          totalDatasets: infraData.meta.totalDatasets,
          categorias: infraData.meta.categorias,
          economia: infraData.economia.total,
          saude: infraData.saude.total,
          educacao: infraData.educacao.total,
          seguranca: infraData.seguranca.total,
          meioAmbiente: infraData.meioAmbiente.total,
          transportes: infraData.transportes.total,
          trabalho: infraData.trabalho.total,
          turismo: infraData.turismo.total,
        },
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in infra-intelligence function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
