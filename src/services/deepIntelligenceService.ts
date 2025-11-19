/**
 * Serviço para análise de inteligência profunda dos dados.gov.br
 */

import { supabase } from "@/integrations/supabase/client";

export interface DeepIntelligenceAnalysis {
  metadata: {
    timestamp: string;
    total_datasets_analyzed: number;
    total_organizations: number;
    total_categories: number;
    analysis_model: string;
  };
  statistics: {
    totalDatasets: number;
    totalOrganizations: number;
    totalTags: number;
    topOrganizations: Array<{ org: string; count: number }>;
    topTags: Array<{ tag: string; count: number }>;
    datasetsWithResources: number;
    avgResourcesPerDataset: number;
  };
  organizations: {
    top10: Array<{ org: string; count: number }>;
    total: number;
    distribution: Array<{
      name: string;
      datasets: number;
      avgResources: number;
    }>;
  };
  categories: {
    top20: Array<{ tag: string; count: number }>;
    total: number;
    distribution: Array<{
      tag: string;
      datasets: number;
    }>;
  };
  ai_analysis: {
    tendencias?: Array<{
      titulo: string;
      descricao: string;
      impacto: 'alto' | 'medio' | 'baixo';
    }>;
    lacunas?: Array<{
      area: string;
      descricao: string;
      prioridade: 'alta' | 'media' | 'baixa';
    }>;
    qualidade?: {
      score: number;
      analise: string;
      pontosFracos: string[];
      pontosFortes: string[];
    };
    oportunidades?: Array<{
      titulo: string;
      descricao: string;
      datasets_relacionados: string[];
      potencial: 'alto' | 'medio' | 'baixo';
    }>;
    recomendacoes?: {
      empresas: string[];
      pesquisadores: string[];
      desenvolvedores: string[];
    };
    insights?: Array<{
      titulo: string;
      descricao: string;
      acao_sugerida: string;
    }>;
    correlacoes?: Array<{
      area1: string;
      area2: string;
      relacao: string;
      potencial_analise: string;
    }>;
    resumo_executivo?: string;
    raw_response?: string;
  };
  sample_datasets: Array<{
    id: string;
    title: string;
    organization: string;
    tags: any;
    resources: number;
    last_modified: string;
  }>;
}

export async function buscarAnaliseInteligentteProfunda(): Promise<DeepIntelligenceAnalysis> {
  console.log('Solicitando análise de inteligência profunda...');

  const { data, error } = await supabase.functions.invoke('deep-intelligence', {
    body: {},
  });

  if (error) {
    console.error('Erro ao buscar análise profunda:', error);
    throw error;
  }

  if (!data.success) {
    throw new Error(data.error || 'Erro desconhecido na análise');
  }

  return data.data;
}
