// Löst ein Storyblok-Multilink-Feld zu einer nutzbaren URL auf.
// Multilink-Form: { linktype: "url"|"story"|"email"|"asset", url, cached_url }
export function resolveStoryblokLink(link) {
  if (!link) return { href: "", isExternal: false };

  // E-Mail-Links tragen die Adresse in `email`, nicht in url/cached_url.
  if (link.linktype === "email" && link.email) {
    return { href: "mailto:" + link.email, isExternal: true };
  }

  const raw = link.url || link.cached_url || "";
  if (!raw) return { href: "", isExternal: false };

  // Reiner In-Page-Anker (#section) bleibt intern – kein neues Tab.
  if (raw.startsWith("#")) return { href: raw, isExternal: false };

  const isExternal =
    link.linktype === "url" ||
    /^https?:\/\//.test(raw) ||
    /^(mailto|tel):/.test(raw);

  if (isExternal) return { href: raw, isExternal: true };

  // Interne Story: führenden Slash normalisieren → immer genau ein "/" am Anfang,
  // optionalen Anker (link.anchor) anhängen.
  const anchor = link.anchor ? "#" + link.anchor : "";
  return { href: "/" + raw.replace(/^\/+/, "") + anchor, isExternal: false };
}
