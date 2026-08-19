import { createServer } from "node:http";
import next from "next";

const hostname = "0.0.0.0";
const rawPort = process.env.PORT || process.env.NODE_PORT || "3000";
const port = Number.parseInt(rawPort, 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Nieprawidłowy port aplikacji Node.js.");
  process.exit(1);
}

const dev = process.env.NODE_ENV === "development";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function start() {
  await app.prepare();

  const server = createServer(async (request, response) => {
    try {
      await handle(request, response);
    } catch {
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
    console.error("Nie udało się uruchomić serwera:", error.message);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`YAMURA Dziennik Realizacji działa na porcie ${port}.`);
  });

  function shutdown() {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("Nie udało się przygotować aplikacji:", error.message);
  process.exit(1);
});
