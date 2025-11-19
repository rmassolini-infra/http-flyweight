import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InmetEstacao } from "@/infra/climate/inmetService";
import { CloudRain, MapPin, Mountain } from "lucide-react";

interface InmetStationsListProps {
  stations: InmetEstacao[];
  maxItems?: number;
}

export const InmetStationsList = ({ stations, maxItems = 10 }: InmetStationsListProps) => {
  const displayItems = stations.slice(0, maxItems);

  // Group by state
  const stateCount = new Map<string, number>();
  stations.forEach(s => {
    stateCount.set(s.SG_ESTADO, (stateCount.get(s.SG_ESTADO) || 0) + 1);
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-card-foreground">Total de Estações</h4>
          </div>
          <p className="text-2xl font-bold text-primary">{stations.length}</p>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-accent" />
            <h4 className="text-sm font-semibold text-card-foreground">Estados Cobertos</h4>
          </div>
          <p className="text-2xl font-bold text-accent">{stateCount.size}</p>
        </div>
      </div>

      {/* Stations List */}
      <div className="space-y-3">
        {displayItems.map((station) => (
          <Card key={station.CD_ESTACAO} className="p-4 border-border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-card-foreground">
                    {station.DC_NOME}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {station.SG_ESTADO}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    <span>{station.VL_LATITUDE.toFixed(4)}°, {station.VL_LONGITUDE.toFixed(4)}°</span>
                  </div>
                  
                  {station.VL_ALTITUDE && (
                    <div className="flex items-center gap-1.5">
                      <Mountain className="h-3 w-3" />
                      <span>{station.VL_ALTITUDE.toFixed(0)}m</span>
                    </div>
                  )}
                </div>
                
                {station.DT_INICIO_OPERACAO && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Em operação desde: {new Date(station.DT_INICIO_OPERACAO).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                {station.CD_ESTACAO}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {stations.length > maxItems && (
        <div className="p-4 bg-secondary/30 border border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {maxItems} de {stations.length} estações
          </p>
        </div>
      )}
    </div>
  );
};
