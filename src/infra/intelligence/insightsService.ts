import { IbgeMunicipio } from "../geo/ibgeService";
import { DespesaOrcamentaria } from "../finance/portalTransparenciaService";
import { DadosGovDataset } from "../infra/dadosGovService";

/**
 * INPUT padrão (igual v1, com campos extras opcionais para série histórica).
 */
export interface IntelligenceInput {
  municipios: IbgeMunicipio[];
  potenciaGD: Record<string, number>; // codMunicipio -> kW GD
  despesas: DespesaOrcamentaria[];
  datasetsInfra: {
    dnit: DadosGovDataset[];
    antt: DadosGovDataset[];
  };
  clima?: any;

  // opcional v2 – se você quiser plugar depois:
  historicoPotenciaGD?: Record<string, Record<string, number>>; // ano -> codMunicipio -> kW
  historicoDespesas?: Record<string, DespesaOrcamentaria[]>; // ano -> lista
}

export interface Insight {
  tipo: "alerta" | "risco" | "oportunidade" | "correlacao";
  titulo: string;
  descricao: string;
  dadosRelacionados?: any;
}

/**
 * Saída v2 – além dos insights textuais, traz um ranking com scores.
 */
export interface ScoredMunicipioInsight {
  municipioId: number;
  municipioNome: string;
  uf: string;

  // features que usamos pra gerar os scores
  features: {
    potenciaGDkW: number;
    potenciaGDPerCapitaAprox: number;
    gastoPublicoRelativo?: number; // se conseguirmos ligar algum gasto ao município (por enquanto opcional)
  };

  // Scores (0–100) para cada dimensão
  scores: {
    oportunidadeSolar: number;        // baixa GD per capita => maior score
    riscoSobrecarga: number;         // alta GD total => maior score
    prioridadeInvestimentoPublico: number; // placeholder (pode evoluir com dados fiscais municipais)
    prioridadeVisitaComercial: number;     // combinação ponderada dos outros scores
  };
}

export interface IntelligenceV2Output {
  insightsTextuais: Insight[];
  municipiosRankeados: ScoredMunicipioInsight[];
  metadadosModelo: {
    versao: string;
    descricao: string;
    parametros: Record<string, any>;
  };
}

/**
 * v1 – mantém se você já estiver usando em algum lugar.
 */
export function gerarInsightsDeInteligencia(input: IntelligenceInput): Insight[] {
  const insights: Insight[] = [];

  const municipiosComPoucaGD = input.municipios
    .map((m) => ({
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
      id: m.id,
      potencia: input.potenciaGD[m.id] ?? 0,
    }))
    .sort((a, b) => a.potencia - b.potencia)
    .slice(0, 20);

  insights.push({
    tipo: "oportunidade",
    titulo: "Municípios com baixa geração solar distribuída",
    descricao:
      "Estes municípios possuem baixa ou nenhuma potência instalada de GD. São hotspots imediatos para expansão comercial e projetos de infraestrutura local.",
    dadosRelacionados: municipiosComPoucaGD,
  });

  const correlacaoPopGD = input.municipios
    .map((m) => {
      const potencia = input.potenciaGD[m.id] ?? 0;
      const populacaoAprox =
        Number(m.microrregiao?.mesorregiao?.UF?.id ?? 1) * 500; // placeholder para não quebrar
      return {
        municipio: m.nome,
        potencia,
        populacaoAprox,
        potenciaPorMilHabitantes: potencia / (populacaoAprox / 1000),
      };
    })
    .sort((a, b) => a.potenciaPorMilHabitantes - b.potenciaPorMilHabitantes)
    .slice(0, 15);

  insights.push({
    tipo: "correlacao",
    titulo: "Correlação: municípios com população alta e pouca GD",
    descricao:
      "Demanda alta + oferta baixa = oportunidade de mercado, ganho de eficiência energética e potenciais clusters estratégicos.",
    dadosRelacionados: correlacaoPopGD,
  });

  const gastosAcimaDaMédia = input.despesas
    .filter((d) => d.valorPago > 50_000_000)
    .map((d) => ({
      orgao: d.nomeOrgao,
      valorPago: d.valorPago,
      ano: d.ano,
    }));

  if (gastosAcimaDaMédia.length > 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Gastos públicos atípicos detectados",
      descricao:
        "Foram detectados órgãos com gastos muito acima da média. Isso indica oportunidades de oferta B2G, contratos, editais ou riscos de execução.",
      dadosRelacionados: gastosAcimaDaMédia,
    });
  }

  insights.push({
    tipo: "oportunidade",
    titulo: "Datasets estratégicos de infraestrutura (DNIT & ANTT)",
    descricao:
      "Há recursos de rodovias, ferrovias, logística e concessões disponíveis. Podem ser ingestados para análises de risco, planejamento de obras e otimização de frotas.",
    dadosRelacionados: {
      dnit: input.datasetsInfra.dnit.map((d) => d.title),
      antt: input.datasetsInfra.antt.map((d) => d.title),
    },
  });

  const municipiosComRiscoDeSobrecarga = Object.entries(input.potenciaGD)
    .map(([cod, potencia]) => {
      const m = input.municipios.find((x) => String(x.id) === cod);
      if (!m) return null;
      return {
        municipio: m.nome,
        uf: m.microrregiao.mesorregiao.UF.sigla,
        potencia,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.potencia - a.potencia)
    .slice(0, 10);

  insights.push({
    tipo: "risco",
    titulo: "Risco de sobrecarga: municípios com muita potência GD instalada",
    descricao:
      "Locais com alta densidade de GD podem enfrentar desafios de estabilidade, compensação e futura redução de créditos — bons candidatos para consultoria técnica e soluções de gestão.",
    dadosRelacionados: municipiosComRiscoDeSobrecarga,
  });

  if (input.clima) {
    insights.push({
      tipo: "alerta",
      titulo: "Alerta climático: eventos recentes podem impactar ativos",
      descricao:
        "Dados do INMET indicam eventos recentes que podem afetar obras, frotas ou geração energética. Risco operacional elevado.",
      dadosRelacionados: input.clima,
    });
  }

  return insights;
}

/**
 * V2 – com scores numéricos e pronto para plugar ML.
 */
export function gerarInsightsDeInteligenciaV2(
  input: IntelligenceInput
): IntelligenceV2Output {
  const insightsTextuais = gerarInsightsDeInteligencia(input);

  // --------- Normalização básica para scores 0–100 ---------
  const municipios = input.municipios;

  // Aproximação grosseira de população (até você plugar o dado real):
  const featuresPorMunicipio = municipios.map((m) => {
    const potenciaGDkW = input.potenciaGD[m.id] ?? 0;
    const populacaoAprox =
      Number(m.microrregiao?.mesorregiao?.UF?.id ?? 1) * 500;

    const potenciaGDPerCapitaAprox =
      populacaoAprox > 0 ? potenciaGDkW / populacaoAprox : 0;

    return {
      municipio: m,
      potenciaGDkW,
      populacaoAprox,
      potenciaGDPerCapitaAprox,
    };
  });

  const maxPotencia = Math.max(
    1,
    ...featuresPorMunicipio.map((f) => f.potenciaGDkW)
  );
  const maxPotPerCapita = Math.max(
    0.00001,
    ...featuresPorMunicipio.map((f) => f.potenciaGDPerCapitaAprox)
  );

  function clamp01(v: number) {
    if (!Number.isFinite(v)) return 0;
    return Math.min(1, Math.max(0, v));
  }

  const municipiosRankeados: ScoredMunicipioInsight[] =
    featuresPorMunicipio.map((f) => {
      const baseOportunidade =
        1 - clamp01(f.potenciaGDPerCapitaAprox / maxPotPerCapita);
      const baseRiscoSobrecarga = clamp01(f.potenciaGDkW / maxPotencia);

      // Sem dados fiscais municipais diretos ainda => placeholder 0.5
      const prioridadeInvestimentoPublico = 0.5;

      // Combinação ponderada – aqui você brinca com "o modelo":
      const prioridadeVisitaComercial =
        0.6 * baseOportunidade +
        0.3 * baseRiscoSobrecarga +
        0.1 * prioridadeInvestimentoPublico;

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
          prioridadeInvestimentoPublico: Math.round(
            prioridadeInvestimentoPublico * 100
          ),
          prioridadeVisitaComercial: Math.round(
            prioridadeVisitaComercial * 100
          ),
        },
      };
    });

  // Ordena por prioridade de visita comercial (maior primeiro)
  municipiosRankeados.sort(
    (a, b) =>
      b.scores.prioridadeVisitaComercial -
      a.scores.prioridadeVisitaComercial
  );

  const metadadosModelo = {
    versao: "2.0.0",
    descricao:
      "Motor heurístico de inteligência territorial e energética. Usa GD, população aproximada e estrutura para ser evoluído com ML supervisionado.",
    parametros: {
      pesoOportunidadeSolar: 0.6,
      pesoRiscoSobrecarga: 0.3,
      pesoInvestimentoPublico: 0.1,
      normalizacao: "min-max aproximada em 0–1",
    },
  };

  return {
    insightsTextuais,
    municipiosRankeados,
    metadadosModelo,
  };
}
