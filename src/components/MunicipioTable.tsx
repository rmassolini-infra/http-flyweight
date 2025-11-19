import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IbgeMunicipio } from "@/infra/geo/ibgeService";

interface MunicipioTableProps {
  municipios: IbgeMunicipio[];
  maxItems?: number;
}

export const MunicipioTable = ({ municipios, maxItems = 10 }: MunicipioTableProps) => {
  const displayItems = municipios.slice(0, maxItems);

  return (
    <div className="bg-secondary/50 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-secondary/70">
            <TableHead className="text-card-foreground font-semibold">ID</TableHead>
            <TableHead className="text-card-foreground font-semibold">Município</TableHead>
            <TableHead className="text-card-foreground font-semibold">UF</TableHead>
            <TableHead className="text-card-foreground font-semibold">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayItems.map((municipio) => (
            <TableRow key={municipio.id} className="border-border hover:bg-secondary/70">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {municipio.id}
              </TableCell>
              <TableCell className="font-medium text-card-foreground">
                {municipio.nome}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-semibold">
                  {municipio.microrregiao.mesorregiao.UF.sigla}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {municipio.microrregiao.mesorregiao.UF.nome}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {municipios.length > maxItems && (
        <div className="p-4 bg-secondary/30 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {maxItems} de {municipios.length} municípios
          </p>
        </div>
      )}
    </div>
  );
};
