/**
 * Cliente para o edge function de insights do MAPA
 */

export interface MAPAInsightsResponse {
  insights: string;
  dataAnalyzed: {
    agrotoxicosTotal: number;
    certificacaoOrganicaTotal: number;
    zoneamentoTotal: number;
    areaCertificada: number;
  };
}

export async function gerarInsightsMAPA(mapaData: any): Promise<MAPAInsightsResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/mapa-insights`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ mapaData }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
