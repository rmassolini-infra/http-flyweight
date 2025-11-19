import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { DespesasTable } from "./DespesasTable";
import { DespesaOrcamentaria } from "@/infra/finance/portalTransparenciaService";
import { useState } from "react";

interface PortalTransparenciaCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  despesas?: DespesaOrcamentaria[];
  error?: string;
  onFetch: (codigoOrgao: string, ano: string) => void;
}

export const PortalTransparenciaCard = ({
  title,
  description,
  isLoading,
  isSuccess,
  isError,
  despesas,
  error,
  onFetch,
}: PortalTransparenciaCardProps) => {
  const [codigoOrgao, setCodigoOrgao] = useState("26000"); // Ministério da Educação
  const [ano, setAno] = useState("2024");

  const handleFetch = () => {
    if (codigoOrgao && ano) {
      onFetch(codigoOrgao, ano);
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 md:col-span-2">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
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
            API Portal da Transparência
          </Badge>
          {despesas && (
            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
              {despesas.length} registros
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="codigoOrgao" className="text-sm text-card-foreground mb-2 block">
              Código do Órgão
            </Label>
            <Input
              id="codigoOrgao"
              type="text"
              value={codigoOrgao}
              onChange={(e) => setCodigoOrgao(e.target.value)}
              placeholder="Ex: 26000 (MEC)"
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="ano" className="text-sm text-card-foreground mb-2 block">
              Ano
            </Label>
            <Input
              id="ano"
              type="text"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              placeholder="Ex: 2024"
              className="bg-background"
            />
          </div>
        </div>

        <Button 
          onClick={handleFetch}
          disabled={isLoading || !codigoOrgao || !ano}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando dados...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Buscar Despesas
            </>
          )}
        </Button>
      </div>

      {(despesas || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}
          
          {despesas && despesas.length > 0 && (
            <DespesasTable despesas={despesas} maxItems={10} />
          )}
        </div>
      )}
    </Card>
  );
};
