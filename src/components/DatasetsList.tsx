import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DadosGovDataset } from "@/infra/infra/dadosGovService";
import { Database, ExternalLink, FileText } from "lucide-react";

interface DatasetsListProps {
  datasets: DadosGovDataset[];
  maxItems?: number;
}

export const DatasetsList = ({ datasets, maxItems = 10 }: DatasetsListProps) => {
  const displayItems = datasets.slice(0, maxItems);

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'CSV': 'bg-primary/10 text-primary border-primary/20',
      'JSON': 'bg-accent/10 text-accent border-accent/20',
      'XML': 'bg-primary/10 text-primary border-primary/20',
      'PDF': 'bg-destructive/10 text-destructive border-destructive/20',
      'XLS': 'bg-accent/10 text-accent border-accent/20',
      'XLSX': 'bg-accent/10 text-accent border-accent/20',
    };
    return colors[format.toUpperCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold text-card-foreground">Total de Datasets</h4>
        </div>
        <p className="text-2xl font-bold text-primary">{datasets.length}</p>
      </div>

      {/* Datasets Cards */}
      <div className="space-y-3">
        {displayItems.map((dataset) => (
          <Card key={dataset.id} className="p-4 border-border bg-card hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-card-foreground line-clamp-2">
                    {dataset.title}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dataset.organization.title}
                </p>
              </div>

              {dataset.resources && dataset.resources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{dataset.resources.length} recursos disponíveis</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dataset.resources.slice(0, 5).map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                      >
                        <Badge className={getFormatColor(resource.format)}>
                          {resource.format}
                        </Badge>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {datasets.length > maxItems && (
        <div className="p-4 bg-secondary/30 border border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {maxItems} de {datasets.length} datasets
          </p>
        </div>
      )}
    </div>
  );
};
