import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";
import { AneelDataTable } from "./AneelDataTable";
import { AneelGdEmpreendimento } from "@/infra/energy/aneelService";

interface AneelApiCardProps {
  title: string;
  description: string;
  endpoint: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  empreendimentos?: AneelGdEmpreendimento[];
  error?: string;
  onFetch: () => void;
}

export const AneelApiCard = ({
  title,
  description,
  endpoint,
  isLoading,
  isSuccess,
  isError,
  empreendimentos,
  error,
  onFetch,
}: AneelApiCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 md:col-span-2">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-accent" />
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
        
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="font-mono text-xs">
            CSV {endpoint}
          </Badge>
          {empreendimentos && (
            <Badge className="bg-accent/10 text-accent border-accent/20">
              {empreendimentos.length} registros (limite: 500)
            </Badge>
          )}
        </div>

        <Button 
          onClick={onFetch}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando CSV da ANEEL... (pode demorar ~30s)
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Buscar Dados de Geração Distribuída
            </>
          )}
        </Button>
      </div>

      {(empreendimentos || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}
          
          {empreendimentos && empreendimentos.length > 0 && (
            <AneelDataTable empreendimentos={empreendimentos} maxItems={15} />
          )}
        </div>
      )}
    </Card>
  );
};
