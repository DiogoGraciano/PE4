const port = Number(process.env.PORT) || 4173;
const apiUrl = process.env.VITE_API_URL || "http://localhost:3000";

// Lê o index.html e substitui o placeholder pela URL real da API
const rawHtml = await Bun.file("./dist/index.html").text();
const indexHtml = rawHtml.replaceAll("__API_URL_PLACEHOLDER__", apiUrl);

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = `./dist${path}`;

    // Para arquivos JS, substituir o placeholder também
    if (path.endsWith(".js")) {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const content = (await file.text()).replaceAll("__API_URL_PLACEHOLDER__", apiUrl);
        return new Response(content, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    // index.html com placeholder substituído
    if (path === "/index.html") {
      return new Response(indexHtml, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // SPA fallback
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`Frontend servindo na porta ${port}`);
console.log(`API URL: ${apiUrl}`);
