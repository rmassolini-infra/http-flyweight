import { InfraIntelligenceCard } from "@/components/InfraIntelligenceCard";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-end">
          <Button 
            onClick={() => navigate('/deep-intelligence')}
            size="lg"
            className="gap-2"
          >
            <Brain className="h-5 w-5" />
            Análise Profunda com IA
          </Button>
        </div>
        <InfraIntelligenceCard />
      </div>
    </div>
  );
};

export default Index;

