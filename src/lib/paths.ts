/** Prefixes a site-relative path ("/csharp/x/") with the configured base path. */
export function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}
