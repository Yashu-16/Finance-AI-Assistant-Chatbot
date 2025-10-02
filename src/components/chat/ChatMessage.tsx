import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bot, User, ExternalLink } from "lucide-react";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    intent?: string;
    sources?: string[];
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      <div className={`flex-1 max-w-3xl ${isAssistant ? "" : "flex justify-end"}`}>
        <Card
          className={`p-4 ${
            isAssistant ? "bg-card" : "bg-primary text-primary-foreground"
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.intent && isAssistant && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline">Intent: {message.intent}</Badge>
            </div>
          )}

          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-semibold mb-2">Sources:</p>
              <div className="space-y-1">
                {message.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 hover:underline text-primary"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {source}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
