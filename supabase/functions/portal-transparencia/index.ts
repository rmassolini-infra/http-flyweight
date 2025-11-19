import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DespesaOrcamentaria {
  codigoOrgao: string;
  nomeOrgao: string;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  ano: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { codigoOrgao, ano } = body;
    
    if (!codigoOrgao || !ano) {
      return new Response(
        JSON.stringify({ error: "codigoOrgao and ano are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const apiKey = Deno.env.get("PORTAL_TRANSP_API_KEY");
    if (!apiKey) {
      console.error("PORTAL_TRANSP_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const url = `https://api.portaldatransparencia.gov.br/api-de-dados/despesas?codigoOrgao=${codigoOrgao}&ano=${ano}&pagina=1`;
    
    console.log(`Fetching despesas from Portal da Transparência: ${url}`);

    const response = await fetch(url, {
      headers: {
        "chave-api-dados": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Portal API error: ${response.status} - ${errorText}`);

      // Fallback: quando a API do Portal retorna erro (ex: 403),
      // devolvemos uma lista vazia para não quebrar o frontend
      const despesasVazias: DespesaOrcamentaria[] = [];

      return new Response(JSON.stringify(despesasVazias), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data = await response.json();
    
    const despesas: DespesaOrcamentaria[] = data.map((d: any) => ({
      codigoOrgao: d.codigoOrgao || "",
      nomeOrgao: d.nomeOrgao || "",
      valorEmpenhado: Number(d.valorEmpenhado) || 0,
      valorLiquidado: Number(d.valorLiquidado) || 0,
      valorPago: Number(d.valorPago) || 0,
      ano: d.exercicio || ano,
    }));

    console.log(`Successfully fetched ${despesas.length} despesas`);

    return new Response(JSON.stringify(despesas), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in portal-transparencia function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
