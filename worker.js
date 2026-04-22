// SwiftProxy – Cloudflare Worker Backend
// Deploy at: https://workers.cloudflare.com (free tier is plenty)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Proxy-URL",
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    // Target URL passed as ?url=https://example.com
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      // Forward the request to the target
      const proxyReq = new Request(targetUrl.toString(), {
        method: request.method,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "identity",
        },
        redirect: "follow",
      });

      const resp = await fetch(proxyReq);
      const contentType = resp.headers.get("content-type") || "text/html";
      let body = await resp.text();

      // If HTML, rewrite URLs so assets/links route back through this proxy
      if (contentType.includes("text/html")) {
        body = rewriteHtml(body, targetUrl.toString(), request.url.split("?")[0]);
      }

      return new Response(body, {
        status: resp.status,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": contentType,
          "X-Proxied-URL": targetUrl.toString(),
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
  },
};

function rewriteHtml(html, baseUrl, workerBase) {
  // Rewrite all absolute and relative URLs to go through the proxy
  const rewrite = (href) => {
    if (!href) return href;
    href = href.trim();
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("#") || href.startsWith("data:")) return href;
    try {
      const abs = new URL(href, baseUrl).href;
      return `${workerBase}?url=${encodeURIComponent(abs)}`;
    } catch { return href; }
  };

  // href attributes
  html = html.replace(/\bhref=["']([^"']+)["']/gi, (m, h) => `href="${rewrite(h)}"`);
  // src attributes
  html = html.replace(/\bsrc=["']([^"']+)["']/gi, (m, s) => `src="${rewrite(s)}"`);
  // action attributes (forms)
  html = html.replace(/\baction=["']([^"']+)["']/gi, (m, a) => `action="${rewrite(a)}"`);
  // srcset
  html = html.replace(/\bsrcset=["']([^"']+)["']/gi, (m, ss) => {
    const rewritten = ss.split(",").map(part => {
      const [u, ...rest] = part.trim().split(/\s+/);
      return [rewrite(u), ...rest].join(" ");
    }).join(", ");
    return `srcset="${rewritten}"`;
  });

  // Inject base tag to help relative URLs
  html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseUrl}">`);

  return html;
}
