import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { MunicipioTable } from "./MunicipioTable";
import { IbgeMunicipio } from "@/infra/geo/ibgeService";

interface IbgeApiCardProps {
  title: string;
  description: string;
  endpoint: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  municipios?: IbgeMunicipio[];
  error?: string;
  onFetch: () => void;
}

export const IbgeApiCard = ({
  title,
  description,
  endpoint,
  isLoading,
  isSuccess,
  isError,
  municipios,
  error,
  onFetch,
}: IbgeApiCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 md:col-span-2">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
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
        
        <div className="mb-4">
          <Badge variant="secondary" className="font-mono text-xs">
            GET {endpoint}
          </Badge>
          {municipios && (
            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
              {municipios.length} municípios
            </Badge>
          )}
        </div>

        <Button 
          onClick={onFetch}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando dados do IBGE...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Buscar Municípios
            </>
          )}
        </Button>
      </div>

      {(municipios || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}
          
          {municipios && municipios.length > 0 && (
            <MunicipioTable municipios={municipios} maxItems={10} />
          )}
        </div>
      )}
    </Card>
  );
};
