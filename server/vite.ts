import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Serve project-root public/audio during development to allow assets
  // placed in /public/audio to be accessed via /audio/* URLs.
  // This complements Vite's client/public handling.
  app.use(
    "/audio",
    express.static(path.resolve(import.meta.dirname, "..", "public", "audio"))
  );

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    // Never serve index.html for API routes; let Express API handlers or 404s handle them
    if (url.startsWith("/api/")) {
      return next();
    }

    // If the request appears to be for a static asset (has a file extension),
    // defer to Vite's static file middleware to serve it. Returning index.html
    // for assets like audio files will break media playback in the browser.
    try {
      const parsed = new URL(`${req.protocol}://${req.get("host")}${url}`);
      const ext = path.extname(parsed.pathname);
      if (ext) {
        return next();
      }
    } catch {}

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Serve built client from project-root dist/public
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  const publicAudioPath = path.resolve(import.meta.dirname, "..", "public", "audio");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Support GitHub Pages base prefix locally if VITE_BASE is set (e.g., /quranpro)
  const basePrefix = process.env.VITE_BASE ?? "/";

  // Serve audio assets placed in project-root public/audio (used by KidsLearning etc.)
  if (fs.existsSync(publicAudioPath)) {
    app.use("/audio", express.static(publicAudioPath));
  }

  // Default static at root
  app.use(express.static(distPath));

  // If a non-root base is configured, also serve static under that prefix
  if (basePrefix !== "/") {
    app.use(basePrefix, express.static(distPath));
  }

  // SPA fallbacks: serve index.html
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  if (basePrefix !== "/") {
    app.use(`${basePrefix}*`, (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}
