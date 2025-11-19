import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
            INFRA BR DATA
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Plataforma centralizada de acesso a dados públicos brasileiros em infraestrutura, 
            energia, agricultura, finanças governamentais e clima. APIs oficiais integradas 
            com inteligência artificial para análises estratégicas.
          </p>

          <Button
            onClick={() => navigate('/palantir-report')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300"
          >
            <Brain className="mr-2 h-5 w-5" />
            Palantir Intelligence Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

