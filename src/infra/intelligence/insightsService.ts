import { IbgeMunicipio } from "../geo/ibgeService";
import { AneelGdEmpreendimento } from "../energy/aneelService";
import { DespesaOrcamentaria } from "../finance/portalTransparenciaService";
import { DadosGovDataset } from "../infra/dadosGovService";

export interface IntelligenceInput {
  municipios: IbgeMunicipio[];
  potenciaGD: Record<string, number>;
  despesas: DespesaOrcamentaria[];
  datasetsInfra: {
    dnit: DadosGovDataset[];
    antt: DadosGovDataset[];
  };
  clima?: any; // opcional (INMET)
}

export interface Insight {
  tipo: "alerta" | "risco" | "oportunidade" | "correlacao";
  titulo: string;
  descricao: string;
  dadosRelacionados?: any;
}

export function gerarInsightsDeInteligencia(input: IntelligenceInput): Insight[] {
  const insights: Insight[] = [];

  // ---------------------------------------------------------
  // 1. OPORTUNIDADE – Municípios com baixa geração distribuída
  // ---------------------------------------------------------
  const municipiosComPoucaGD = input.municipios
    .map((m) => ({
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
      id: m.id,
      potencia: input.potenciaGD[m.id] ?? 0,
    }))
    .sort((a, b) => a.potencia - b.potencia)
    .slice(0, 20); // top 20 piores

  insights.push({
    tipo: "oportunidade",
    titulo: "Municípios com baixa geração solar distribuída",
    descricao:
      "Estes municípios possuem baixa ou nenhuma potência instalada de GD. São hotspots imediatos para expansão de prospecção ou projetos de infraestrutura local.",
    dadosRelacionados: municipiosComPoucaGD,
  });

  // ---------------------------------------------------------
  // 2. CORRELAÇÃO – População × Potência GD
  // ---------------------------------------------------------
  const correlacaoPopGD = input.municipios
    .map((m) => {
      const potencia = input.potenciaGD[m.id] ?? 0;
      const populacaoAprox =
        Number(m.microrregiao?.mesorregiao?.UF?.id) * 500; // placeholder: IBGE real pode usar função obterPopulacaoMunicipio()

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

  // ---------------------------------------------------------
  // 3. ALERTA – Gastos públicos incompatíveis com infraestrutura local
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 4. OPORTUNIDADE – Datasets de infraestrutura disponíveis
  // ---------------------------------------------------------
  insights.push({
    tipo: "oportunidade",
    titulo: "Novos datasets estratégicos de infraestrutura (DNIT & ANTT)",
    descricao:
      "Há novos recursos de rodovias, ferrovias, logística e concessões disponíveis. Podem ser ingestados para análises de risco, planejamento de obras e otimização de frotas.",
    dadosRelacionados: {
      dnit: input.datasetsInfra.dnit.map((d) => ({
        titulo: d.title,
        org: d.organization.title,
        recursos: d.resources.map((r) => r.url),
      })),
      antt: input.datasetsInfra.antt.map((d) => ({
        titulo: d.title,
        org: d.organization.title,
        recursos: d.resources.map((r) => r.url),
      })),
    },
  });

  // ---------------------------------------------------------
  // 5. RISCO – Municípios com alta GD e potencial sobrecarga futura
  // ---------------------------------------------------------
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
      "Locais com alta densidade de GD podem enfrentar desafios de estabilidade, compensação e futura redução de créditos — bom para oferta de consultoria técnica.",
    dadosRelacionados: municipiosComRiscoDeSobrecarga,
  });

  // ---------------------------------------------------------
  // 6. CORRELAÇÃO – Infraestrutura logística próxima aos clusters de GD
  // ---------------------------------------------------------
  if (input.datasetsInfra.dnit.length > 0) {
    insights.push({
      tipo: "correlacao",
      titulo: "Correlação entre clusters solares e infraestrutura logística",
      descricao:
        "A presença de rodovias, ferrovias e portos próximos aos clusters de GD sugere regiões com maior maturidade econômica e abertura para projetos de alto CAPEX.",
      dadosRelacionados: {
        dnitDatasets: input.datasetsInfra.dnit.length,
        anttDatasets: input.datasetsInfra.antt.length,
        recomendacao:
          "Analisar sobreposição espacial entre polos de GD e infraestrutura para identificar regiões com potencial de parques solares, usinas híbridas e logística de manutenção.",
      },
    });
  }

  // ---------------------------------------------------------
  // 7. ALERTA – (Opcional) Clima: eventos agudos impactando ativos
  // ---------------------------------------------------------
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
