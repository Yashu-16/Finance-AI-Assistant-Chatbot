import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Shield, TrendingUp, Zap, Bot, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (session) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Finance Customer Service
              <span className="gradient-primary bg-clip-text text-transparent"> AI Chatbot</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Get instant answers to your financial questions with AI-powered assistance backed by real data
            </p>
            <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="shadow-elevated" onClick={handleGetStarted}>
                {session ? "Go to Chat" : "Get Started"}
              </Button>
              <Link to="/faqs">
                <Button variant="outline" size="lg">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Powerful Features for Finance Support
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <Bot className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Responses</h3>
                <p className="text-muted-foreground">
                  Real LLM integration using Gemini 2.5 Flash for accurate, contextual answers
                </p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <MessageSquare className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Intent Classification</h3>
                <p className="text-muted-foreground">
                  Automatically categorizes queries: accounts, loans, fraud, investments, disputes
                </p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real Finance Data</h3>
                <p className="text-muted-foreground">
                  50+ FAQs from real financial institutions, no mock data
                </p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <TrendingUp className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Live Market Data</h3>
                <p className="text-muted-foreground">
                  Real-time interest rates and financial data via FRED API
                </p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <Zap className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Context Awareness</h3>
                <p className="text-muted-foreground">
                  Maintains conversation history for personalized, coherent responses
                </p>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300">
                <BarChart3 className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Track questions, intents, and satisfaction metrics
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience AI-Powered Finance Support?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join now and get instant answers to your financial questions
            </p>
            <Button size="lg" className="shadow-elevated" onClick={handleGetStarted}>
              {session ? "Start Chatting" : "Sign Up Now"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2025 Finance AI Chatbot. Production-ready demo with real data integration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
