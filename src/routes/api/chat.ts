import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["OPENROUTER_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "Missing OPENROUTER_API_KEY" },
            { status: 500 }
          );
        }

        let body: { messages?: ChatMessage[]; model?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json({ error: "messages is required" }, { status: 400 });
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "NodeOps Chat",
          },
          body: JSON.stringify({
            model: body.model ?? "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are NodeOps, a concise and helpful assistant for a simple Node.js chat app.",
              },
              ...messages.slice(-20),
            ],
          }),
        });

        if (!res.ok) {
          const detail = await res.text();
          return Response.json(
            { error: "OpenRouter request failed", status: res.status, detail },
            { status: res.status === 429 ? 429 : 502 }
          );
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content ?? "";

        return Response.json({ reply });
      },
    },
  },
});
