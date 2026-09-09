import { createServer } from "node:http";
import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import next from "next";

const hostname = "0.0.0.0";
const rawPort = process.env.PORT || process.env.NODE_PORT || "3000";
const isNumericPort = /^\d+$/.test(String(rawPort).trim());
const port = isNumericPort ? Number.parseInt(String(rawPort).trim(), 10) : rawPort;
const logDirectory = join(process.cwd(), "logs");
const logFile = join(logDirectory, "node-app.log");

function formatError(error) {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return String(error);
}

function logEvent(level, message, details) {
  const suffix = details ? ` | ${formatError(details)}` : "";
  const line = `${new Date().toISOString()} [${level}] ${message}${suffix}\n`;

  try {
    mkdirSync(logDirectory, { recursive: true });
    appendFileSync(logFile, line, "utf8");
  } catch (error) {
    console.error("Nie udało się zapisać dziennika aplikacji:", error);
  }

  if (level === "ERROR") {
    console.error(line.trim());
  } else {
    console.log(line.trim());
  }
}

if (isNumericPort && (port < 1 || port > 65535)) {
  console.error("Nieprawidłowy port aplikacji Node.js.");
  process.exit(1);
}

const hasBuild = existsSync(join(process.cwd(), ".next", "BUILD_ID"));
const dev = process.env.NODE_ENV === "development" && !hasBuild;
const app = next({ dev, hostname, port: isNumericPort ? port : 3000 });
const handle = app.getRequestHandler();

async function start() {
  await app.prepare();

  const server = createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/api/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", "no-store");
      response.end(
        JSON.stringify({
          status: "ok",
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    try {
      await handle(request, response);
    } catch (error) {
      logEvent("ERROR", `Nieobsłużony błąd żądania ${request.method || "UNKNOWN"}.`, error);

      if (!response.writableEnded) {
        if (!response.headersSent) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
        }
        response.end("Wewnętrzny błąd serwera.");
      }
    }
  });

  server.on("error", (error) => {
    logEvent("ERROR", "Błąd serwera HTTP.", error);
    process.exit(1);
  });

  const onListening = () => {
    logEvent(
      "INFO",
      `YAMURA Dziennik Realizacji uruchomiona: pid=${process.pid}, port=${port}, node=${process.version}, mode=${dev ? "development" : "production"}.`,
    );
  };

  if (isNumericPort) {
    server.listen(port, hostname, onListening);
  } else {
    server.listen(port, onListening);
  }

  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logEvent("WARN", `Otrzymano sygnał ${signal}. Rozpoczynam zatrzymanie.`);

    server.close(() => {
      logEvent("INFO", "Serwer HTTP został poprawnie zatrzymany.");
      process.exit(0);
    });

    setTimeout(() => {
      logEvent("ERROR", "Przekroczono czas bezpiecznego zatrzymania serwera.");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("uncaughtException", (error) => {
  logEvent("ERROR", "Nieobsłużony wyjątek procesu.", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logEvent("ERROR", "Nieobsłużone odrzucenie Promise.", reason);
});

start().catch((error) => {
  logEvent("ERROR", "Nie udało się przygotować aplikacji.", error);
  process.exit(1);
});
