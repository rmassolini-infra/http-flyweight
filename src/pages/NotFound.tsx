import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark palantir-grid relative">
      {/* Hexagonal overlay */}
      <div className="fixed inset-0 palantir-hex opacity-30 pointer-events-none" />
      
      <div className="text-center relative z-10">
        <div className="palantir-border bg-card/50 backdrop-blur-sm rounded-lg p-12 palantir-corner inline-block">
          <h1 className="mb-4 text-6xl font-bold font-mono text-primary palantir-glow">404</h1>
          <p className="mb-6 text-xl text-muted-foreground font-mono">ERRO: ROTA NÃO ENCONTRADA</p>
          <a 
            href="/" 
            className="text-primary underline hover:text-accent transition-colors font-mono inline-flex items-center gap-2 palantir-glow"
          >
            <span>▸</span> RETORNAR AO HUB <span>◂</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
