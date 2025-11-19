/**
 * Cliente para buscar inteligência v2 com scores
 */

export interface ScoredMunicipioInsight {
  municipioId: number;
  municipioNome: string;
  uf: string;
  features: {
    potenciaGDkW: number;
    potenciaGDPerCapitaAprox: number;
    gastoPublicoRelativo?: number;
  };
  scores: {
    oportunidadeSolar: number;
    riscoSobrecarga: number;
    prioridadeInvestimentoPublico: number;
    prioridadeVisitaComercial: number;
  };
}

export interface InteligenciaV2Response {
  meta: {
    geradoEm: string;
    fontes: {
      ibge: boolean;
      aneel: boolean;
      portalTransparencia: boolean;
      dadosGov: boolean;
    };
  };
  inteligencia: {
    insightsTextuais: any[];
    municipiosRankeados: ScoredMunicipioInsight[];
    metadadosModelo: {
      versao: string;
      descricao: string;
      parametros: Record<string, any>;
    };
  };
}

export async function buscarInteligenciaV2(): Promise<InteligenciaV2Response> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/inteligencia-v2`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
