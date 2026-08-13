import { createFileRoute } from "@tanstack/react-router";
import os from "os";

export const Route = createFileRoute("/api/info")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            application: "NodeOps",
            version: "1.0.0",
            hostname: os.hostname(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});
