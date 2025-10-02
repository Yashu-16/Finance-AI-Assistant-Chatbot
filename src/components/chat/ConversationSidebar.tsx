import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationSidebar = ({ currentConversationId, onSelectConversation }: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase.from("conversations").delete().eq("id", id);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        onSelectConversation(null);
      }

      toast({
        title: "Conversation deleted",
      });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Failed to delete conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
      ) : (
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate text-sm">{conversation.title}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={(e) => handleDelete(conversation.id, e)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationSidebar;
