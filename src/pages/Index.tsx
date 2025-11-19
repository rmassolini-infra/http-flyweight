import { useState } from "react";
import { ApiCard } from "@/components/ApiCard";
import { httpGetJson, HttpError } from "@/infra/core/httpClient";
import { useToast } from "@/hooks/use-toast";
import { Activity, Code2 } from "lucide-react";

interface FetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: any;
  error?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [githubState, setGithubState] = useState<FetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  
  const [quotesState, setQuotesState] = useState<FetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const fetchGithubData = async () => {
    setGithubState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await httpGetJson("https://api.github.com/users/github");
      setGithubState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        data 
      });
      toast({
        title: "Success!",
        description: "GitHub data fetched successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "An unexpected error occurred";
      
      setGithubState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchQuoteData = async () => {
    setQuotesState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await httpGetJson("https://api.quotable.io/random");
      setQuotesState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        data 
      });
      toast({
        title: "Success!",
        description: "Quote fetched successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "An unexpected error occurred";
      
      setQuotesState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-glow">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-12 w-12 text-primary animate-pulse" />
            <Code2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
            HTTP Client Dashboard
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            A modern API testing platform showcasing robust HTTP client infrastructure with error handling, timeouts, and clean TypeScript patterns.
          </p>
        </div>
      </div>

      {/* API Cards Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <ApiCard
            title="GitHub User API"
            description="Fetch user information from GitHub's public API"
            endpoint="https://api.github.com/users/github"
            isLoading={githubState.isLoading}
            isSuccess={githubState.isSuccess}
            isError={githubState.isError}
            data={githubState.data}
            error={githubState.error}
            onFetch={fetchGithubData}
          />
          
          <ApiCard
            title="Random Quote API"
            description="Get inspirational quotes from quotable.io"
            endpoint="https://api.quotable.io/random"
            isLoading={quotesState.isLoading}
            isSuccess={quotesState.isSuccess}
            isError={quotesState.isError}
            data={quotesState.data}
            error={quotesState.error}
            onFetch={fetchQuoteData}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Built-in Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Timeout Handling</h3>
              <p className="text-sm text-muted-foreground">
                Automatic request cancellation with configurable timeout thresholds
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Type Safety</h3>
              <p className="text-sm text-muted-foreground">
                Full TypeScript support with generic type parameters for responses
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Error Management</h3>
              <p className="text-sm text-muted-foreground">
                Custom HttpError class with status codes and detailed error messages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
