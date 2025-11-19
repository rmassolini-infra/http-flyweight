/**
 * Cliente para o edge function de insights da ANEEL
 */

export interface AneelInsightsResponse {
  insights: string;
  dataAnalyzed: {
    geracaoDistribuidaTotal: number;
    geracaoTotal: number;
    transmissaoTotal: number;
    ouvidoriaTotal: number;
  };
}

export async function gerarInsightsAneel(aneelData: any): Promise<AneelInsightsResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/aneel-insights`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ aneelData }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
