import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiCardProps {
  title: string;
  description: string;
  endpoint: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  data?: any;
  error?: string;
  onFetch: () => void;
}

export const ApiCard = ({
  title,
  description,
  endpoint,
  isLoading,
  isSuccess,
  isError,
  data,
  error,
  onFetch,
}: ApiCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-card hover:shadow-glow transition-all duration-300">
      <div className="bg-gradient-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-primary" />}
          {isError && <XCircle className="h-5 w-5 text-destructive" />}
        </div>
        
        <div className="mb-4">
          <Badge variant="secondary" className="font-mono text-xs">
            GET {endpoint}
          </Badge>
        </div>

        <Button 
          onClick={onFetch}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            'Fetch Data'
          )}
        </Button>
      </div>

      {(data || error) && (
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}
          
          {data && (
            <div className="bg-secondary/50 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs font-mono text-card-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
