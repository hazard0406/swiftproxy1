SwiftProxy

SwiftProxy is a free, lightweight web proxy browser that lets you browse any website anonymously and securely — no installs, no extensions, just open the page and go. Built with vanilla HTML, CSS, and JavaScript on the frontend, and powered by a Cloudflare Worker on the backend for real server-side request fetching. Unlike browser-only proxies that fail due to CORS restrictions, SwiftProxy routes all requests through a Cloudflare Worker, meaning pages are fetched server-to-server before being delivered to you — keeping your real IP hidden and bypassing most network restrictions. Features include HTTPS support, automatic link and asset rewriting, a built-in navigation toolbar with back/forward/reload, and a clean modern UI inspired by CroxyProxy. The entire stack runs on free tiers — Cloudflare Workers (100k requests/day free) and your choice of static hosting such as GitHub Pages, Netlify, or Cloudflare Pages — making it completely free to deploy and use.

Stack

Frontend: HTML, CSS, Vanilla JavaScript
Backend: Cloudflare Worker (serverless)
Hosting: GitHub Pages / Netlify / Cloudflare Pages

Setup

Deploy worker.js to Cloudflare Workers
Host index.html on any static hosting provider
Open the site, enter your Worker URL, and start browsing
