import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Database, Search } from "lucide-react";
import { DatasetsList } from "./DatasetsList";
import { DadosGovDataset } from "@/infra/infra/dadosGovService";
import { useState } from "react";

interface DadosGovCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  datasets?: DadosGovDataset[];
  error?: string;
  onFetch: (query: string) => void;
}

export const DadosGovCard = ({
  title,
  description,
  isLoading,
  isSuccess,
  isError,
  datasets,
  error,
  onFetch,
}: DadosGovCardProps) => {
  const [query, setQuery] = useState("DNIT rodovia");

  const handleFetch = () => {
    if (query.trim()) {
      onFetch(query.trim());
    }
  };

  const quickSearches = [
    { label: "DNIT Rodovias", query: "DNIT rodovia" },
    { label: "ANTT Ferrovias", query: "ANTT ferrovia" },
    { label: "Infraestrutura", query: "infraestrutura transporte" },
  ];

  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 md:col-span-2">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-accent" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-accent" />}
          {isError && <XCircle className="h-5 w-5 text-destructive" />}
        </div>
        
        <div className="mb-4">
          <Badge variant="secondary" className="font-mono text-xs">
            API CKAN - dados.gov.br
          </Badge>
          {datasets && (
            <Badge className="ml-2 bg-accent/10 text-accent border-accent/20">
              {datasets.length} datasets encontrados
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="query" className="text-sm text-card-foreground mb-2 block">
              Buscar Datasets
            </Label>
            <div className="flex gap-2">
              <Input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="Ex: DNIT rodovia, ANTT ferrovia"
                className="bg-background flex-1"
              />
              <Button 
                onClick={handleFetch}
                disabled={isLoading || !query.trim()}
                variant="secondary"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <Button
                key={item.query}
                onClick={() => {
                  setQuery(item.query);
                  onFetch(item.query);
                }}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {(datasets || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}
          
          {datasets && datasets.length > 0 && (
            <DatasetsList datasets={datasets} maxItems={8} />
          )}

          {datasets && datasets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum dataset encontrado para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
