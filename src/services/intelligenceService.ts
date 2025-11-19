/**
 * Cliente para buscar insights de inteligência do dashboard agregado
 */

import { buscarDashboardAgregado } from "./dashboardService";
import { gerarInsightsDeInteligencia, Insight } from "@/infra/intelligence/insightsService";

export async function buscarInsightsInteligencia(): Promise<Insight[]> {
  // Buscar dados agregados
  const dashboard = await buscarDashboardAgregado();
  
  // Converter para formato de entrada do serviço de insights
  const municipiosCompletos = dashboard.municipios.map((m) => ({
    id: m.id,
    nome: m.nome,
    microrregiao: {
      mesorregiao: {
        UF: {
          sigla: m.uf,
          nome: m.uf,
          id: 0, // placeholder
        },
      },
    },
  }));

  const input = {
    municipios: municipiosCompletos,
    potenciaGD: dashboard.energia.potenciaGDPorMunicipio,
    despesas: dashboard.financasPublicas.despesasOrgaoAmostra,
    datasetsInfra: {
      dnit: dashboard.infraestrutura.datasetsDnit.map((d) => ({
        id: d.id,
        name: d.id,
        title: d.title,
        organization: { title: d.organization },
        resources: Array(d.resources).fill(null).map((_, i) => ({
          id: `${d.id}-resource-${i}`,
          name: `Resource ${i + 1}`,
          format: "CSV",
          url: "#",
        })),
      })),
      antt: dashboard.infraestrutura.datasetsAntt.map((d) => ({
        id: d.id,
        name: d.id,
        title: d.title,
        organization: { title: d.organization },
        resources: Array(d.resources).fill(null).map((_, i) => ({
          id: `${d.id}-resource-${i}`,
          name: `Resource ${i + 1}`,
          format: "CSV",
          url: "#",
        })),
      })),
    },
  };

  return gerarInsightsDeInteligencia(input);
}
