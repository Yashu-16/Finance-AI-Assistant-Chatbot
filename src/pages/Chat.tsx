import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Menu, Plus, MessageSquare, HelpCircle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/chat/ChatInterface";
import ConversationSidebar from "@/components/chat/ConversationSidebar";
import FAQTab from "@/components/chat/FAQTab";
import AnalyticsTab from "@/components/chat/AnalyticsTab";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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
      setRefreshKey((prev) => prev + 1);
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
          key={refreshKey}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
          {!sidebarOpen && (
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Finance AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">Your intelligent financial companion</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Admin
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 px-4">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="faqs" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
              <ChatInterface conversationId={currentConversationId} userId={session?.user?.id} />
            </TabsContent>
            
            <TabsContent value="faqs" className="flex-1 overflow-auto mt-0">
              <FAQTab />
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 overflow-auto mt-0">
              <AnalyticsTab userId={session?.user?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Chat;
