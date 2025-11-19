import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrossAnalysisData {
  municipios?: any;
  energia?: any;
  financas?: any;
  infraestrutura?: any;
  clima?: any;
  agricultura?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'data is required' }),
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

    console.log('Performing cross-data intelligence analysis...');

    // Construir resumo dos dados disponíveis
    const dataSummary = [];
    
    if (data.municipios) {
      dataSummary.push(`**IBGE - Municípios:** ${data.municipios.total || 0} municípios mapeados`);
    }
    
    if (data.energia) {
      dataSummary.push(`**ANEEL - Energia:**
- Geração Distribuída: ${data.energia.geracaoDistribuida?.total || 0} empreendimentos (${((data.energia.geracaoDistribuida?.potenciaTotal || 0) / 1000).toFixed(1)} MW)
- Usinas (SIGA): ${data.energia.geracao?.total || 0} usinas (${data.energia.geracao?.potenciaTotal || 0} MW)
- Transmissão: ${data.energia.transmissao?.total || 0} linhas (${data.energia.transmissao?.extensaoTotal || 0} km)`);
    }
    
    if (data.financas) {
      dataSummary.push(`**Portal da Transparência - Finanças Públicas:**
- Despesas registradas: ${data.financas.total || 0} órgãos
- Valor total: ${data.financas.valorTotal ? 'R$ ' + (data.financas.valorTotal / 1000000).toFixed(2) + ' milhões' : 'N/A'}`);
    }
    
    if (data.infraestrutura) {
      dataSummary.push(`**dados.gov.br - Infraestrutura:**
- Datasets DNIT: ${data.infraestrutura.dnit?.length || 0}
- Datasets ANTT: ${data.infraestrutura.antt?.length || 0}`);
    }
    
    if (data.clima) {
      dataSummary.push(`**INMET - Clima:**
- Estações meteorológicas: ${data.clima.total || 0}`);
    }
    
    if (data.agricultura) {
      dataSummary.push(`**MAPA - Agricultura:**
- Agrotóxicos registrados: ${data.agricultura.agrotoxicos?.total || 0}
- Certificação orgânica: ${data.agricultura.certificacaoOrganica?.total || 0} (${data.agricultura.certificacaoOrganica?.areaTotalCertificada || 0} ha)
- Zoneamento agrícola: ${data.agricultura.zoneamento?.total || 0} zonas`);
    }

    const prompt = `Você é um especialista em análise estratégica de dados governamentais brasileiros. Realize uma análise CRUZADA E CORRELACIONAL dos dados abaixo, identificando padrões, relações e insights que emergem da combinação dessas diferentes fontes.

DADOS DISPONÍVEIS:

${dataSummary.join('\n\n')}

INSTRUÇÕES PARA ANÁLISE CRUZADA:

1. **CORRELAÇÕES GEOGRÁFICAS**: Identifique regiões com alta concentração de energia renovável E alta atividade agrícola, correlacionando com investimentos em infraestrutura.

2. **CORRELAÇÕES ECONÔMICAS**: Relacione despesas públicas com desenvolvimento de infraestrutura energética e agrícola por região.

3. **CORRELAÇÕES CLIMÁTICAS**: Conecte dados climáticos (INMET) com zoneamento agrícola (MAPA) e geração de energia renovável (ANEEL).

4. **CORRELAÇÕES DE SUSTENTABILIDADE**: Analise a relação entre agricultura orgânica, uso de agrotóxicos e geração de energia limpa.

5. **CORRELAÇÕES DE DESENVOLVIMENTO**: Identifique municípios com convergência de investimentos em energia, agricultura e infraestrutura.

FORNEÇA (FORMATO ESTRUTURADO):

## 1. SÍNTESE EXECUTIVA
(2-3 parágrafos sobre o panorama geral do Brasil baseado nos dados cruzados)

## 2. CORRELAÇÕES CRÍTICAS IDENTIFICADAS
(5-7 correlações mais importantes entre diferentes fontes de dados, com números específicos)

Exemplo:
- **Energia x Agricultura**: Estados com maior geração distribuída (SP: X MW) também lideram em certificação orgânica (Y hectares)

## 3. PADRÕES REGIONAIS EMERGENTES
(3-5 padrões geográficos identificados ao cruzar os dados)

## 4. OPORTUNIDADES DE SINERGIA
(4-6 oportunidades onde investimentos coordenados entre setores gerariam maior impacto)

## 5. RISCOS E GAPS IDENTIFICADOS
(3-5 riscos ou lacunas evidenciadas pela análise cruzada)

## 6. RECOMENDAÇÕES ESTRATÉGICAS INTEGRADAS
(5-7 ações prioritárias que considerem múltiplas dimensões - energia, agricultura, infraestrutura, clima)

IMPORTANTE: 
- Use números ESPECÍFICOS dos dados fornecidos
- Cite FONTES ao fazer correlações (ex: "Dados ANEEL mostram... enquanto dados MAPA indicam...")
- Seja TÉCNICO e OBJETIVO
- Foque em insights ACIONÁVEIS`;

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
        temperature: 0.8,
        max_tokens: 4000,
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
    const analysis = aiData.choices[0].message.content;

    console.log('Cross-data intelligence analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis,
        dataSources: {
          municipios: !!data.municipios,
          energia: !!data.energia,
          financas: !!data.financas,
          infraestrutura: !!data.infraestrutura,
          clima: !!data.clima,
          agricultura: !!data.agricultura,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in cross-intelligence function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
