import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, CloudRain, AlertCircle } from "lucide-react";
import { InmetStationsList } from "./InmetStationsList";
import { InmetEstacao } from "@/infra/climate/inmetService";

interface InmetCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  stations?: InmetEstacao[];
  error?: string;
  onFetch: () => void;
}

export const InmetCard = ({
  title,
  description,
  isLoading,
  isSuccess,
  isError,
  stations,
  error,
  onFetch,
}: InmetCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 md:col-span-2">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CloudRain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-primary" />}
          {isError && <XCircle className="h-5 w-5 text-destructive" />}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="font-mono text-xs">
            API INMET
          </Badge>
          {stations && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {stations.length} estações meteorológicas
            </Badge>
          )}
        </div>

        {!isSuccess && !isError && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-accent">
                <strong>Nota:</strong> A API do INMET pode ter limitações de acesso público. 
                Esta demonstração pode usar dados de exemplo caso o endpoint não esteja disponível.
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={onFetch}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando estações INMET...
            </>
          ) : (
            <>
              <CloudRain className="mr-2 h-4 w-4" />
              Buscar Estações Meteorológicas
            </>
          )}
        </Button>
      </div>

      {(stations || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo dados de exemplo devido à indisponibilidade da API
              </p>
            </div>
          )}
          
          {stations && stations.length > 0 && (
            <InmetStationsList stations={stations} maxItems={12} />
          )}

          {stations && stations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CloudRain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma estação encontrada</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
