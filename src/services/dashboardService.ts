/**
 * Cliente para o dashboard agregado
 * Chama o edge function que consolida dados de múltiplas APIs
 */

export interface MunicipioAgregado {
  id: number;
  nome: string;
  uf: string;
  potenciaGDkW: number;
}

export interface DashboardAgregado {
  municipios: MunicipioAgregado[];
  energia: {
    potenciaGDPorMunicipio: Record<string, number>;
    totalMunicipiosComGD: number;
  };
  financasPublicas: {
    despesasOrgaoAmostra: any[];
  };
  infraestrutura: {
    datasetsDnit: Array<{
      id: string;
      title: string;
      organization: string;
      resources: number;
    }>;
    datasetsAntt: Array<{
      id: string;
      title: string;
      organization: string;
      resources: number;
    }>;
  };
  meta: {
    geradoEm: string;
    fontes: {
      ibge: boolean;
      aneel: boolean;
      portalTransparencia: boolean;
      dadosGov: boolean;
    };
  };
}

export async function buscarDashboardAgregado(): Promise<DashboardAgregado> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/dashboard-agregado`;

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
