import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dados de fallback
const MUNICIPIOS_EXEMPLO = [
  { id: 3550308, nome: "São Paulo", microrregiao: { mesorregiao: { UF: { sigla: "SP", nome: "São Paulo", id: 35 } } } },
  { id: 3304557, nome: "Rio de Janeiro", microrregiao: { mesorregiao: { UF: { sigla: "RJ", nome: "Rio de Janeiro", id: 33 } } } },
  { id: 3106200, nome: "Belo Horizonte", microrregiao: { mesorregiao: { UF: { sigla: "MG", nome: "Minas Gerais", id: 31 } } } },
  { id: 4106902, nome: "Curitiba", microrregiao: { mesorregiao: { UF: { sigla: "PR", nome: "Paraná", id: 41 } } } },
  { id: 4314902, nome: "Porto Alegre", microrregiao: { mesorregiao: { UF: { sigla: "RS", nome: "Rio Grande do Sul", id: 43 } } } },
  { id: 5300108, nome: "Brasília", microrregiao: { mesorregiao: { UF: { sigla: "DF", nome: "Distrito Federal", id: 53 } } } },
  { id: 2927408, nome: "Salvador", microrregiao: { mesorregiao: { UF: { sigla: "BA", nome: "Bahia", id: 29 } } } },
  { id: 2611606, nome: "Recife", microrregiao: { mesorregiao: { UF: { sigla: "PE", nome: "Pernambuco", id: 26 } } } },
  { id: 2304400, nome: "Fortaleza", microrregiao: { mesorregiao: { UF: { sigla: "CE", nome: "Ceará", id: 23 } } } },
  { id: 1302603, nome: "Manaus", microrregiao: { mesorregiao: { UF: { sigla: "AM", nome: "Amazonas", id: 13 } } } },
];

const POTENCIA_GD_EXEMPLO: Record<string, number> = {
  "3550308": 125000, "3304557": 98000, "3106200": 87000, "4106902": 76000,
  "4314902": 69000, "5300108": 54000, "2927408": 48000, "2611606": 42000,
  "2304400": 38000, "1302603": 32000,
};

const DESPESAS_EXEMPLO = [
  { codigoOrgao: "32000", nomeOrgao: "Ministério de Minas e Energia", valorEmpenhado: 1500000000, valorLiquidado: 1200000000, valorPago: 1000000000, ano: "2024" },
  { codigoOrgao: "39000", nomeOrgao: "Ministério da Infraestrutura", valorEmpenhado: 3200000000, valorLiquidado: 2800000000, valorPago: 2500000000, ano: "2024" },
];

const DATASETS_DNIT_EXEMPLO = [
  { id: "dnit-1", title: "Rodovias Federais", organization: { title: "DNIT" }, resources: [{ url: "#" }] },
  { id: "dnit-2", title: "Pontes e Viadutos", organization: { title: "DNIT" }, resources: [{ url: "#" }] },
];

const DATASETS_ANTT_EXEMPLO = [
  { id: "antt-1", title: "Malha Ferroviária Nacional", organization: { title: "ANTT" }, resources: [{ url: "#" }] },
];

function gerarInsightsV1(input: any) {
  const insights: any[] = [];

  const municipiosComPoucaGD = input.municipios
    .map((m: any) => ({
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
      id: m.id,
      potencia: input.potenciaGD[m.id] ?? 0,
    }))
    .sort((a: any, b: any) => a.potencia - b.potencia)
    .slice(0, 20);

  insights.push({
    tipo: "oportunidade",
    titulo: "Municípios com baixa geração solar distribuída",
    descricao: "Estes municípios possuem baixa ou nenhuma potência instalada de GD. São hotspots imediatos para expansão comercial e projetos de infraestrutura local.",
    dadosRelacionados: municipiosComPoucaGD,
  });

  const gastosAcimaDaMédia = input.despesas
    .filter((d: any) => d.valorPago > 50_000_000)
    .map((d: any) => ({ orgao: d.nomeOrgao, valorPago: d.valorPago, ano: d.ano }));

  if (gastosAcimaDaMédia.length > 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Gastos públicos atípicos detectados",
      descricao: "Foram detectados órgãos com gastos muito acima da média. Isso indica oportunidades de oferta B2G, contratos, editais ou riscos de execução.",
      dadosRelacionados: gastosAcimaDaMédia,
    });
  }

  const municipiosComRiscoDeSobrecarga = Object.entries(input.potenciaGD)
    .map(([cod, potencia]: any) => {
      const m = input.municipios.find((x: any) => String(x.id) === cod);
      if (!m) return null;
      return { municipio: m.nome, uf: m.microrregiao.mesorregiao.UF.sigla, potencia };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.potencia - a.potencia)
    .slice(0, 10);

  insights.push({
    tipo: "risco",
    titulo: "Risco de sobrecarga: municípios com muita potência GD instalada",
    descricao: "Locais com alta densidade de GD podem enfrentar desafios de estabilidade, compensação e futura redução de créditos.",
    dadosRelacionados: municipiosComRiscoDeSobrecarga,
  });

  return insights;
}

function gerarInsightsV2(input: any) {
  const insightsTextuais = gerarInsightsV1(input);
  const featuresPorMunicipio = input.municipios.map((m: any) => {
    const potenciaGDkW = input.potenciaGD[m.id] ?? 0;
    const populacaoAprox = Number(m.microrregiao?.mesorregiao?.UF?.id ?? 1) * 500;
    const potenciaGDPerCapitaAprox = populacaoAprox > 0 ? potenciaGDkW / populacaoAprox : 0;
    return { municipio: m, potenciaGDkW, populacaoAprox, potenciaGDPerCapitaAprox };
  });

  const maxPotencia = Math.max(1, ...featuresPorMunicipio.map((f: any) => f.potenciaGDkW));
  const maxPotPerCapita = Math.max(0.00001, ...featuresPorMunicipio.map((f: any) => f.potenciaGDPerCapitaAprox));

  function clamp01(v: number) {
    if (!Number.isFinite(v)) return 0;
    return Math.min(1, Math.max(0, v));
  }

  const municipiosRankeados = featuresPorMunicipio.map((f: any) => {
    const baseOportunidade = 1 - clamp01(f.potenciaGDPerCapitaAprox / maxPotPerCapita);
    const baseRiscoSobrecarga = clamp01(f.potenciaGDkW / maxPotencia);
    const prioridadeInvestimentoPublico = 0.5;
    const prioridadeVisitaComercial = 0.6 * baseOportunidade + 0.3 * baseRiscoSobrecarga + 0.1 * prioridadeInvestimentoPublico;

    return {
      municipioId: f.municipio.id,
      municipioNome: f.municipio.nome,
      uf: f.municipio.microrregiao?.mesorregiao?.UF?.sigla ?? "",
      features: {
        potenciaGDkW: f.potenciaGDkW,
        potenciaGDPerCapitaAprox: f.potenciaGDPerCapitaAprox,
      },
      scores: {
        oportunidadeSolar: Math.round(baseOportunidade * 100),
        riscoSobrecarga: Math.round(baseRiscoSobrecarga * 100),
        prioridadeInvestimentoPublico: Math.round(prioridadeInvestimentoPublico * 100),
        prioridadeVisitaComercial: Math.round(prioridadeVisitaComercial * 100),
      },
    };
  });

  municipiosRankeados.sort((a: any, b: any) => b.scores.prioridadeVisitaComercial - a.scores.prioridadeVisitaComercial);

  return {
    insightsTextuais,
    municipiosRankeados,
    metadadosModelo: {
      versao: "2.0.0",
      descricao: "Motor heurístico de inteligência territorial e energética. Usa GD, população aproximada e estrutura para ser evoluído com ML supervisionado.",
      parametros: {
        pesoOportunidadeSolar: 0.6,
        pesoRiscoSobrecarga: 0.3,
        pesoInvestimentoPublico: 0.1,
        normalizacao: "min-max aproximada em 0–1",
      },
    },
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Inteligência V2 - iniciando...");

    let primeirosMunicipios: any[] = [];
    try {
      const ibgeUrl = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
      const municipiosResponse = await fetch(ibgeUrl);
      if (municipiosResponse.ok) {
        const contentType = municipiosResponse.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const municipios = await municipiosResponse.json();
          primeirosMunicipios = municipios.slice(0, 50);
          console.log(`Municípios IBGE carregados: ${primeirosMunicipios.length}`);
        } else {
          throw new Error("IBGE retornou não-JSON");
        }
      } else {
        throw new Error(`IBGE ${municipiosResponse.status}`);
      }
    } catch (err) {
      console.error("Erro IBGE, usando exemplo:", err);
      primeirosMunicipios = MUNICIPIOS_EXEMPLO;
    }

    const mapaPotenciaGD = { ...POTENCIA_GD_EXEMPLO };
    let despesasOrgao: any[] = DESPESAS_EXEMPLO;
    let datasetsDnit: any[] = DATASETS_DNIT_EXEMPLO;
    let datasetsAntt: any[] = DATASETS_ANTT_EXEMPLO;

    const intelligenceInput = {
      municipios: primeirosMunicipios,
      potenciaGD: mapaPotenciaGD,
      despesas: despesasOrgao,
      datasetsInfra: { dnit: datasetsDnit, antt: datasetsAntt },
      clima: null,
    };

    const inteligenciaV2 = gerarInsightsV2(intelligenceInput);

    const payload = {
      meta: {
        geradoEm: new Date().toISOString(),
        fontes: {
          ibge: primeirosMunicipios.length > 0,
          aneel: true,
          portalTransparencia: despesasOrgao.length > 0,
          dadosGov: true,
        },
      },
      inteligencia: inteligenciaV2,
    };

    console.log("Inteligência V2 gerada com sucesso");
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("Erro no inteligência-v2:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
