import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Send, User, Sparkles, Clock, Calendar, DollarSign, Users 
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIHelperPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your HR AI Assistant. How can I help you today?\n\nYou can ask me about leave policies, payroll, attendance rules, or any HR-related questions.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const suggestedPrompts = [
    "How many annual leave days do I have?",
    "What is the late arrival policy?",
    "When is the next payroll date?",
    "How do I apply for sick leave?",
    "What is the company policy on remote work?",
    "Explain the geo-fencing attendance rule",
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateAIResponse(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1200);
  };

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("leave") || q.includes("annual")) {
      return "You are entitled to **21 annual leave days** per year. You also have **10 sick leave days**. All leaves require approval from your manager.";
    }
    if (q.includes("late") || q.includes("arrival")) {
      return "You have a **15-minute grace period** for late arrivals. After that, it will be marked as late. Consistent lateness may affect your attendance score.";
    }
    if (q.includes("payroll") || q.includes("salary")) {
      return "Payroll is processed on the **25th of every month**. If the 25th falls on a weekend or holiday, it will be paid on the next working day.";
    }
    if (q.includes("sick")) {
      return "For sick leave, you need to submit a medical certificate if the leave is more than 2 consecutive days. You can apply via the Leave module.";
    }
    if (q.includes("geo") || q.includes("location")) {
      return "Geo-fencing is currently **disabled**. When enabled, you must be within 100 meters of the office location (Lat: 6.524379, Long: 3.379206) to clock in.";
    }
    if (q.includes("remote") || q.includes("work from home")) {
      return "Remote work is allowed with prior approval. You must still mark attendance and complete your 8 working hours.";
    }

    return "Thank you for your question. This feature is powered by AI. In a real implementation, this would connect to your company knowledge base and employee data for personalized answers.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-violet-100 dark:bg-violet-950 rounded-2xl">
          <Sparkles className="h-10 w-10 text-violet-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI HR Assistant</h1>
          <p className="text-muted-foreground text-lg">
            Get instant answers to all your HR questions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Suggested Prompts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" /> Suggested Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => {
                    setInput(prompt);
                    sendMessage();
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                This AI assistant can help with:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">Leave</Badge>
                <Badge variant="secondary">Payroll</Badge>
                <Badge variant="secondary">Attendance</Badge>
                <Badge variant="secondary">Policies</Badge>
                <Badge variant="secondary">Benefits</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col h-[700px]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-violet-100">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-violet-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">HR Assistant</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  ● Online • Powered by AI
                </p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-violet-600" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-5 py-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-violet-600" />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-150" />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 border-t bg-card">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything about HR policies, leave, payroll..."
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isThinking}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              AI responses are for guidance. For official requests, use the proper modules.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}