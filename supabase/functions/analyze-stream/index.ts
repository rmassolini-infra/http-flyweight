import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { snapshot } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Analisando snapshot com", snapshot.length, "itens");

    const prompt = `
      Você é uma IA de monitoramento governamental brasileiro (padrão TCU/CGU).
      
      Analise o seguinte JSON de transações em tempo real:
      ${JSON.stringify(snapshot)}
      
      Identifique padrões suspeitos, valores fora da curva ou concentrações anormais.
      Os campos são:
      - id: identificador
      - responsavel: usuário responsável
      - objeto: descrição da transação
      - valor: valor em R$
      - delta: variação
      
      Responda APENAS um JSON válido (sem markdown) neste formato:
      {
        "risk": "CRÍTICO - SURTO DETECTADO" ou "MODERADO" ou "BAIXO",
        "summary": "Análise executiva em 1-2 frases sobre o padrão detectado",
        "anomaly": "Descrição específica da maior anomalia encontrada"
      }
    `;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Você é um auditor federal brasileiro especializado em detecção de anomalias em tempo real." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de taxa excedido. Tente novamente em alguns segundos." 
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage." 
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("Erro na API Lovable AI:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    console.log("Resposta bruta da IA:", aiContent);
    
    // Limpar possível markdown
    const cleanJson = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    console.log("Análise concluída:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro ao processar análise:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        risk: "ERRO",
        summary: "Falha ao processar análise. Tente novamente.",
        anomaly: "Sistema temporariamente indisponível."
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
