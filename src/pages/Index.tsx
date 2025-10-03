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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary animate-in fade-in slide-in-from-top-3">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Financial Assistant</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "0.1s" }}>
              Finance Customer Service
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                AI Chatbot
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "0.2s" }}>
              Get instant answers to your financial questions with AI-powered assistance backed by real data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="shadow-elevated text-base px-8 py-6 h-auto" onClick={handleGetStarted}>
                <MessageSquare className="w-5 h-5 mr-2" />
                {session ? "Go to Chat" : "Get Started"}
              </Button>
              <Link to="/faqs">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto w-full sm:w-auto">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need for intelligent financial customer service
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-elevated">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Responses</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real LLM integration using Gemini 2.5 Flash for accurate, contextual answers
                </p>
              </Card>

              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-elevated">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Intent Classification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically categorizes queries: accounts, loans, fraud, investments, disputes
                </p>
              </Card>

              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-elevated">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Finance Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  50+ FAQs from real financial institutions, no mock data
                </p>
              </Card>

              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-elevated">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Market Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time interest rates and financial data via FRED API
                </p>
              </Card>

              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-elevated">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Context Awareness</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Maintains conversation history for personalized, coherent responses
                </p>
              </Card>

              <Card className="p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-elevated">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track questions, intents, and satisfaction metrics
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience AI-Powered Finance Support?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join now and get instant answers to your financial questions
            </p>
            <Button size="lg" className="shadow-elevated text-base px-8 py-6 h-auto" onClick={handleGetStarted}>
              <MessageSquare className="w-5 h-5 mr-2" />
              {session ? "Start Chatting" : "Sign Up Now"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 Finance AI Chatbot. Developed by Yash Randhe
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
