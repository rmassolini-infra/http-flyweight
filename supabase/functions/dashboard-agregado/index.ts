import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MunicipioAgregado {
  id: number;
  nome: string;
  uf: string;
  potenciaGDkW: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Dashboard agregado - iniciando...");

    // 1) Buscar municípios do IBGE
    const ibgeUrl = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
    const municipiosResponse = await fetch(ibgeUrl);
    
    if (!municipiosResponse.ok) {
      throw new Error(`IBGE API error: ${municipiosResponse.status}`);
    }
    
    const municipios = await municipiosResponse.json();
    const primeirosMunicipios = municipios.slice(0, 50);
    
    console.log(`Municipios carregados: ${primeirosMunicipios.length}`);

    // 2) Buscar dados de energia (ANEEL CSV - simplificado)
    // Nota: Como o CSV é muito grande, vamos usar dados de exemplo
    const mapaPotenciaGD: Record<string, number> = {};
    
    // 3) Buscar despesas do Portal da Transparência
    const apiKey = Deno.env.get("PORTAL_TRANSP_API_KEY");
    let despesasOrgao: any[] = [];
    
    if (apiKey) {
      try {
        const despesasUrl = "https://api.portaldatransparencia.gov.br/api-de-dados/despesas?codigoOrgao=32000&ano=2024&pagina=1";
        const despesasResponse = await fetch(despesasUrl, {
          headers: {
            "chave-api-dados": apiKey,
          },
        });
        
        if (despesasResponse.ok) {
          const despesasData = await despesasResponse.json();
          despesasOrgao = despesasData.slice(0, 20);
          console.log(`Despesas carregadas: ${despesasOrgao.length}`);
        }
      } catch (err) {
        console.error("Erro ao buscar despesas:", err);
      }
    }

    // 4) Buscar datasets de infraestrutura (dados.gov.br)
    const ckanBase = "https://dados.gov.br/api/3/action";
    
    const [dnitResponse, anttResponse] = await Promise.allSettled([
      fetch(`${ckanBase}/package_search?q=${encodeURIComponent("DNIT rodovia")}&rows=10`),
      fetch(`${ckanBase}/package_search?q=${encodeURIComponent("ANTT ferrovia")}&rows=10`),
    ]);

    let datasetsDnit: any[] = [];
    let datasetsAntt: any[] = [];

    if (dnitResponse.status === "fulfilled" && dnitResponse.value.ok) {
      const data = await dnitResponse.value.json();
      datasetsDnit = data.result?.results || [];
      console.log(`Datasets DNIT: ${datasetsDnit.length}`);
    }

    if (anttResponse.status === "fulfilled" && anttResponse.value.ok) {
      const data = await anttResponse.value.json();
      datasetsAntt = data.result?.results || [];
      console.log(`Datasets ANTT: ${datasetsAntt.length}`);
    }

    // 5) Montar payload agregado
    const municipiosAgregados: MunicipioAgregado[] = primeirosMunicipios.map((m: any) => ({
      id: m.id,
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
      potenciaGDkW: mapaPotenciaGD[String(m.id)] || 0,
    }));

    const payload = {
      municipios: municipiosAgregados,
      energia: {
        potenciaGDPorMunicipio: mapaPotenciaGD,
        totalMunicipiosComGD: Object.keys(mapaPotenciaGD).length,
      },
      financasPublicas: {
        despesasOrgaoAmostra: despesasOrgao,
      },
      infraestrutura: {
        datasetsDnit: datasetsDnit.map((d: any) => ({
          id: d.id,
          title: d.title,
          organization: d.organization?.title || "",
          resources: d.resources?.length || 0,
        })),
        datasetsAntt: datasetsAntt.map((d: any) => ({
          id: d.id,
          title: d.title,
          organization: d.organization?.title || "",
          resources: d.resources?.length || 0,
        })),
      },
      meta: {
        geradoEm: new Date().toISOString(),
        fontes: {
          ibge: municipiosAgregados.length > 0,
          aneel: Object.keys(mapaPotenciaGD).length > 0,
          portalTransparencia: despesasOrgao.length > 0,
          dadosGov: datasetsDnit.length > 0 || datasetsAntt.length > 0,
        },
      },
    };

    console.log("Dashboard agregado - concluído com sucesso");

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro no dashboard agregado:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno",
        details: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
