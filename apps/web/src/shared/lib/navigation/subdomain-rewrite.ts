const NON_ORG_SUBDOMAINS = new Set(["app", "www"]);

/**
 * TanStack Router `rewrite.output` (and full-page navigations that bypass the
 * router): map internal `/org/{slug}/…` URLs to `{slug}.{base}` host + path suffix.
 */
export function applyOrgPathOutputRewrite(url: URL): void {
  const parts = url.hostname.split(".");
  const isRootDomain =
    parts.length === 2 ||
    (parts.length === 3 && NON_ORG_SUBDOMAINS.has(parts[0]));
  const baseDomain = parts.slice(-2).join(".");
  const isVercelDomain = baseDomain === "vercel.app";
  const isCustomDomain = baseDomain === "instrideapp.com";

  if (isRootDomain || !(isVercelDomain || isCustomDomain)) {
    return;
  }

  const match = url.pathname.match(/^\/org\/([^/]+)(.*)$/);
  if (!match) {
    return;
  }
  const [, slug, rest] = match;
  const currentDomain = url.hostname.split(".").slice(-2).join(".");
  url.hostname = `${slug}.${currentDomain}`;
  url.pathname = rest || "/";
}
