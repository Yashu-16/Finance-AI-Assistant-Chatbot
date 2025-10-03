import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ThumbsUp, ExternalLink, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  intent: string;
  keywords: string[];
  source_url: string;
  helpful_count: number;
}

const FAQTab = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [searchTerm, selectedCategory, faqs]);

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("helpful_count", { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      console.error("Error loading FAQs:", error);
      toast({
        title: "Failed to load FAQs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    if (searchTerm) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.keywords?.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    setFilteredFaqs(filtered);
  };

  const handleHelpful = async (id: string) => {
    try {
      const faq = faqs.find((f) => f.id === id);
      if (!faq) return;

      const { error } = await supabase
        .from("faqs")
        .update({ helpful_count: faq.helpful_count + 1 })
        .eq("id", id);

      if (error) throw error;

      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, helpful_count: f.helpful_count + 1 } : f))
      );

      toast({
        title: "Thanks for your feedback!",
      });
    } catch (error: any) {
      console.error("Error updating helpful count:", error);
    }
  };

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="h-full bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-6 overflow-auto">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Financial FAQs
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive collection of financial guidance
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-elevated border-border/50">
          <CardContent className="pt-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaqs.length === 0 ? (
            <Card className="col-span-full shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No FAQs found matching your search</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq, index) => (
              <Card 
                key={faq.id} 
                className="hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-elevated">
                      <span className="text-white font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">{faq.question}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">{faq.answer}</CardDescription>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Badge variant="default" className="rounded-full">{faq.category}</Badge>
                    <Badge variant="secondary" className="rounded-full">{faq.intent}</Badge>
                    {faq.keywords?.slice(0, 2).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs rounded-full">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(faq.id)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Helpful ({faq.helpful_count})
                    </Button>
                    {faq.source_url && (
                      <a
                        href={faq.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQTab;
