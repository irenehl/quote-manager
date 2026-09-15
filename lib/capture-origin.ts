const deployedOrigin = "https://quote-manager-rosy.vercel.app";
const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Exact origins only. Forwarded headers and wildcard subdomains are not trusted.
export function captureOriginAllowed(request: Request): boolean {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return false;
  return (
    url.origin === deployedOrigin ||
    (loopbackHosts.has(url.hostname) &&
      (url.protocol === "http:" || url.protocol === "https:"))
  );
}
