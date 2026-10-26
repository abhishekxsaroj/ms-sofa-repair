import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleEnquiry } from "./api/_lib/enquiry.js";

function enquiryPlugin(): Plugin {
  return {
    name: "enquiry-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/contact", (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", async () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8") || "{}";
            const body = JSON.parse(raw) as unknown;
            const ip =
              (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
              req.socket.remoteAddress ||
              "local";
            const result = await handleEnquiry(body, { ip });
            res.statusCode = result.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result.json));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "Invalid request." }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.RESEND_API_KEY = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  process.env.CONTACT_EMAIL = env.CONTACT_EMAIL || process.env.CONTACT_EMAIL;
  process.env.CONTACT_FROM_EMAIL = env.CONTACT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL;

  return {
    plugins: [react(), tailwindcss(), enquiryPlugin()],
    build: {
      target: "es2022",
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("three") || id.includes("@react-three")) return "three";
              if (id.includes("gsap")) return "gsap";
              if (id.includes("react-dom") || id.includes("/react/")) return "react";
            }
          },
        },
      },
    },
  };
});
