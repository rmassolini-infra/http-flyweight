import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AneelGdEmpreendimento } from "@/infra/energy/aneelService";
import { Zap } from "lucide-react";

interface AneelDataTableProps {
  empreendimentos: AneelGdEmpreendimento[];
  maxItems?: number;
}

export const AneelDataTable = ({ empreendimentos, maxItems = 15 }: AneelDataTableProps) => {
  const displayItems = empreendimentos.slice(0, maxItems);

  const formatPotencia = (kw: number) => {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(2)} MW`;
    }
    return `${kw.toFixed(2)} kW`;
  };

  // Calculate some stats
  const totalPotencia = empreendimentos.reduce((sum, e) => sum + e.mdaPotenciaInstaladaKW, 0);
  const fontes = new Set(empreendimentos.map(e => e.dscFonteGeracao));

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-card-foreground">Total de Empreendimentos</h4>
          </div>
          <p className="text-2xl font-bold text-primary">{empreendimentos.length}</p>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-accent" />
            <h4 className="text-sm font-semibold text-card-foreground">Potência Total</h4>
          </div>
          <p className="text-2xl font-bold text-accent">{formatPotencia(totalPotencia)}</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-card-foreground">Tipos de Fonte</h4>
          </div>
          <p className="text-2xl font-bold text-primary">{fontes.size}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-secondary/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/70">
              <TableHead className="text-card-foreground font-semibold">Município</TableHead>
              <TableHead className="text-card-foreground font-semibold">UF</TableHead>
              <TableHead className="text-card-foreground font-semibold">Fonte</TableHead>
              <TableHead className="text-card-foreground font-semibold">Agente</TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">Potência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((emp, idx) => (
              <TableRow key={idx} className="border-border hover:bg-secondary/70">
                <TableCell className="font-medium text-card-foreground">
                  {emp.nomMunicipio}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-semibold">
                    {emp.sigUF}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {emp.dscFonteGeracao}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {emp.sigAgente}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-card-foreground">
                  {formatPotencia(emp.mdaPotenciaInstaladaKW)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {empreendimentos.length > maxItems && (
          <div className="p-4 bg-secondary/30 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {maxItems} de {empreendimentos.length} empreendimentos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
