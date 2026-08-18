import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NodeOps Chat" },
      { name: "description", content: "Simple chat interface for NodeOps" },
      { property: "og:title", content: "NodeOps Chat" },
      { property: "og:description", content: "Simple chat interface for NodeOps" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! Welcome to NodeOps. Type a message below to start chatting.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "(empty response)",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/40 bg-linear-to-r from-card to-card/80 px-6 py-5 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">NodeOps Chat</h1>
            <p className="text-xs text-muted-foreground/80">v1.0.0 · AI-powered chat for Node.js</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 animate-in fade-in-50 duration-300 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-xs ${
                  message.role === "user"
                    ? "bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-lg"
                    : "bg-linear-to-br from-muted to-muted/60 text-muted-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div
                className={`max-w-xl rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "bg-linear-to-br from-primary to-primary/90 text-primary-foreground rounded-br-none"
                    : "bg-card/70 text-foreground rounded-bl-none border border-border/40 backdrop-blur-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-3 animate-in fade-in-50 duration-300">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-muted to-muted/60 text-muted-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-3xl rounded-bl-none bg-card/70 px-5 py-3 text-sm text-muted-foreground border border-border/40 backdrop-blur-sm shadow-sm">
                <span className="inline-flex items-center gap-1">
                  <span>NodeOps is thinking</span>
                  <span className="inline-flex gap-0.5 ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:120ms]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:240ms]"></span>
                  </span>
                </span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border/40 bg-linear-to-t from-card/80 to-card/40 px-4 py-5 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 rounded-2xl border border-input/50 bg-background/80 px-5 py-3.5 text-sm text-foreground outline-none ring-ring transition-all focus:ring-2 focus:border-primary/50 focus:bg-background placeholder:text-muted-foreground/60 backdrop-blur-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none shadow-md"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
