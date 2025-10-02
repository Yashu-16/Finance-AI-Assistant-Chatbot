import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/chat/ChatInterface";
import ConversationSidebar from "@/components/chat/ConversationSidebar";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
    navigate("/");
  };

  const handleNewConversation = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: session.user.id,
          title: "New Conversation",
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConversationId(data.id);
      toast({
        title: "New conversation started",
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 border-r bg-card overflow-hidden`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <Button className="w-full" onClick={handleNewConversation}>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between bg-card">
          {!sidebarOpen && (
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold">Finance AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by real financial data</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/faqs")}>
              FAQs
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Admin
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface conversationId={currentConversationId} userId={session?.user?.id} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
