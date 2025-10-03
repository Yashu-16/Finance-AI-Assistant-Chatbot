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
    <div className={`flex gap-3 ${isAssistant ? "" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      {isAssistant && (
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-elevated">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`flex-1 max-w-3xl ${isAssistant ? "" : "flex justify-end"}`}>
        <Card
          className={`p-4 shadow-card transition-all hover:shadow-elevated ${
            isAssistant 
              ? "bg-card border-border/50" 
              : "gradient-primary text-white border-none"
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
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
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 shadow-elevated">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
