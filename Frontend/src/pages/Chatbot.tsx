import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { storeSummariesToRAG, queryRAG } from "@/utils/api";

interface Source {
  title: string;
  url: string;
  website: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface ChatbotState {
  summary: string;
  topic: string;
  sources: Source[];
}

const Chatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [embeddingsCreated, setEmbeddingsCreated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState<ChatbotState | null>(null);

  useEffect(() => {
    console.log("Chatbot useEffect - location.state:", location.state);
    if (location.state) {
      const { summary, topic, sources } = location.state as ChatbotState;
      console.log("Setting chatState:", { summary, topic, sources });
      setChatState({ summary, topic, sources });
      setMessages([
        {
          id: 1,
          text: `Hi! I'm ready to chat about "${topic}". Ask me anything related to the summary or topic!`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      console.log("No location.state received");
      setMessages([
        {
          id: 1,
          text: "No summary selected. Please select a summary from the index page.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle embedding creation for the summary
  const handleLoadSummary = async () => {
    if (!chatState?.summary) {
      console.log("handleLoadSummary: No summary available");
      const botMessage: Message = {
        id: messages.length + 1,
        text: "No summary selected. Please select a summary from the index page.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No summary selected.",
      });
      return;
    }

    console.log("handleLoadSummary: Starting embedding creation for summary:", chatState.summary);
    setIsEmbedding(true);
    setIsLoading(true);
    try {
      console.log("Calling storeSummariesToRAG with payload:", [chatState.summary]);
      const response = await storeSummariesToRAG([chatState.summary]);
      console.log("storeSummariesToRAG response:", response);
      setEmbeddingsCreated(true);
      const botMessage: Message = {
        id: messages.length + 1,
        text: "Summary loaded successfully. You can now ask questions!",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("handleLoadSummary error:", error);
      const errorMessage = error.message || "Failed to load summary. Please try again.";
      const botMessage: Message = {
        id: messages.length + 1,
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsEmbedding(false);
      setIsLoading(false);
      console.log("handleLoadSummary: Completed, embeddingsCreated:", embeddingsCreated);
    }
  };

  // Auto-load summary embeddings
  useEffect(() => {
    console.log("Auto-load useEffect - Conditions:", {
      hasSummary: !!chatState?.summary,
      embeddingsCreated,
      isEmbedding,
    });
    if (chatState?.summary && !embeddingsCreated && !isEmbedding) {
      console.log("Triggering handleLoadSummary for auto-loading embeddings");
      handleLoadSummary();
    }
  }, [chatState, embeddingsCreated, isEmbedding]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!embeddingsCreated) {
        throw new Error("Please load the summary first.");
      }
      console.log("Calling queryRAG with query:", input);
      const response = await queryRAG(input);
      console.log("queryRAG response:", response);
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.answer,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("handleSendMessage error:", error);
      const errorMessage = error.message || "Failed to process query. Please try again.";
      const botMessage: Message = {
        id: messages.length + 2,
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="summary-container container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0 text-gradient flex items-center">
          <Bot className="mr-2 h-6 w-6" />
          Chatbot
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSummary}
            disabled={isEmbedding || isLoading || !chatState?.summary}
            className="card-hover"
          >
            {isEmbedding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Summary...
              </>
            ) : (
              "Load Summary"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="card-hover"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <Card className="gradient-border-card glass-card md:max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            {chatState ? `Chat about: ${chatState.topic}` : "Chatbot"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[60vh] overflow-y-auto p-4 bg-secondary/10 dark:bg-secondary/20 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-4 animate-fade-in`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {message.sender === "user" ? "You" : "Bot"}
                    </span>
                  </div>
                  <p className="mt-1">{message.text}</p>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={embeddingsCreated ? "Type your message..." : "Load summary first"}
              className="flex-1"
              disabled={isLoading || !embeddingsCreated}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !embeddingsCreated}
              className="card-hover"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;