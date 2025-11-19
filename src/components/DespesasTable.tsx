import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DespesaOrcamentaria } from "@/infra/finance/portalTransparenciaService";
import { DollarSign, TrendingUp } from "lucide-react";

interface DespesasTableProps {
  despesas: DespesaOrcamentaria[];
  maxItems?: number;
}

export const DespesasTable = ({ despesas, maxItems = 10 }: DespesasTableProps) => {
  const displayItems = despesas.slice(0, maxItems);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals
  const totalEmpenhado = despesas.reduce((sum, d) => sum + d.valorEmpenhado, 0);
  const totalLiquidado = despesas.reduce((sum, d) => sum + d.valorLiquidado, 0);
  const totalPago = despesas.reduce((sum, d) => sum + d.valorPago, 0);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-card-foreground">Total Empenhado</h4>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalEmpenhado)}</p>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h4 className="text-sm font-semibold text-card-foreground">Total Liquidado</h4>
          </div>
          <p className="text-xl font-bold text-accent">{formatCurrency(totalLiquidado)}</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-card-foreground">Total Pago</h4>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-secondary/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/70">
              <TableHead className="text-card-foreground font-semibold">Código</TableHead>
              <TableHead className="text-card-foreground font-semibold">Órgão</TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">Empenhado</TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">Liquidado</TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((desp, idx) => (
              <TableRow key={idx} className="border-border hover:bg-secondary/70">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {desp.codigoOrgao}
                </TableCell>
                <TableCell className="font-medium text-card-foreground">
                  {desp.nomeOrgao}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-primary">
                  {formatCurrency(desp.valorEmpenhado)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-accent">
                  {formatCurrency(desp.valorLiquidado)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-card-foreground">
                  {formatCurrency(desp.valorPago)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {despesas.length > maxItems && (
          <div className="p-4 bg-secondary/30 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {maxItems} de {despesas.length} registros
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
