import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ThumbsUp, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
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

const FAQBrowser = () => {
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
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Finance FAQ Knowledge Base</h1>
          <p className="text-xl text-muted-foreground">
            Browse real financial service FAQs from trusted sources
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No FAQs found matching your search</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <CardDescription className="mt-2">{faq.answer}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Badge variant="outline">{faq.category}</Badge>
                    <Badge variant="secondary">{faq.intent}</Badge>
                    {faq.keywords?.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpful(faq.id)}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({faq.helpful_count})
                      </Button>
                      {faq.source_url && (
                        <a
                          href={faq.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Source
                        </a>
                      )}
                    </div>
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

export default FAQBrowser;
