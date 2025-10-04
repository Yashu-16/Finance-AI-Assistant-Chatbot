import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Shield, CreditCard, Banknote, TrendingUp, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sources?: string[];
  created_at: string;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  userId: string;
}

const ChatInterface = ({ conversationId, userId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || !conversationId || loading) return;

    const userMessage = textToSend;
    setInput("");
    setLoading(true);

    try {
      // Insert user message
      const { error: insertError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      if (insertError) throw insertError;

      // Call chat edge function
      const { data, error: functionError } = await supabase.functions.invoke("chat", {
        body: {
          conversationId,
          message: userMessage,
        },
      });

      if (functionError) throw functionError;

      // Track analytics
      await supabase.from("analytics_events").insert({
        user_id: userId,
        event_type: "message_sent",
        event_data: {
          conversation_id: conversationId,
          intent: data?.intent,
        },
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Welcome to Finance AI Assistant</h3>
          <p className="text-muted-foreground mb-4">Start a new conversation to begin</p>
          <p className="text-sm text-muted-foreground">
            Ask about accounts, loans, fraud protection, investments, or general banking questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-2xl font-semibold mb-3">How can I help you today?</h3>
            <p className="text-muted-foreground mb-8">Choose a topic or type your question below</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("How do I report fraud on my account?")}
              >
                <Shield className="w-8 h-8 text-primary" />
                <span className="font-medium">Fraud Protection</span>
                <span className="text-xs text-muted-foreground">Report suspicious activity</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("What information do you need about my account?")}
              >
                <CreditCard className="w-8 h-8 text-primary" />
                <span className="font-medium">Account Info</span>
                <span className="text-xs text-muted-foreground">Balance & transactions</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("What types of loans are available?")}
              >
                <Banknote className="w-8 h-8 text-primary" />
                <span className="font-medium">Loan Inquiry</span>
                <span className="text-xs text-muted-foreground">Explore loan options</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("How should I start investing?")}
              >
                <TrendingUp className="w-8 h-8 text-primary" />
                <span className="font-medium">Investment Help</span>
                <span className="text-xs text-muted-foreground">Investment guidance</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("How do I dispute a charge?")}
              >
                <HelpCircle className="w-8 h-8 text-primary" />
                <span className="font-medium">Dispute Charge</span>
                <span className="text-xs text-muted-foreground">Challenge transactions</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleSend("What are your savings account options?")}
              >
                <CreditCard className="w-8 h-8 text-primary" />
                <span className="font-medium">Banking Services</span>
                <span className="text-xs text-muted-foreground">Accounts & services</span>
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about accounts, loans, fraud, investments..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Developed by Yash Randhe
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
