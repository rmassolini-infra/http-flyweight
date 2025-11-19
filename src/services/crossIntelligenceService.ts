/**
 * Cliente para análise cruzada de inteligência
 */

export interface CrossIntelligenceData {
  municipios?: any;
  energia?: any;
  financas?: any;
  infraestrutura?: any;
  clima?: any;
  agricultura?: any;
}

export interface CrossIntelligenceResponse {
  analysis: string;
  dataSources: {
    municipios: boolean;
    energia: boolean;
    financas: boolean;
    infraestrutura: boolean;
    clima: boolean;
    agricultura: boolean;
  };
  timestamp: string;
}

export async function gerarAnaliseInteligenciaCruzada(
  data: CrossIntelligenceData
): Promise<CrossIntelligenceResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/cross-intelligence`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
