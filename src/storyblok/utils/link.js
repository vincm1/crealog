// Löst ein Storyblok-Multilink-Feld zu einer nutzbaren URL auf.
// Multilink-Form: { linktype: "url"|"story"|"email"|"asset", url, cached_url }
export function resolveStoryblokLink(link) {
  if (!link) return { href: "", isExternal: false };

  const raw = link.url || link.cached_url || "";
  if (!raw) return { href: "", isExternal: false };

  const isExternal =
    link.linktype === "url" ||
    /^https?:\/\//.test(raw) ||
    /^(mailto|tel):/.test(raw);

  if (isExternal) return { href: raw, isExternal: true };

  // Interne Story: führenden Slash normalisieren → immer genau ein "/" am Anfang.
  return { href: "/" + raw.replace(/^\/+/, ""), isExternal: false };
}
