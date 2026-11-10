const isProxy = (url: URL) => url.hostname.endsWith(".translate.goog");
const isWrapper = (url: URL) => /^translate\.google\.[a-z.]+$/.test(url.hostname) && url.pathname === "/translate";

export function getTranslationContext(href: string) {
  const current = new URL(href);
  const translated = isProxy(current) || isWrapper(current);
  const language = (isProxy(current) ? current.searchParams.get("_x_tr_tl") : isWrapper(current) ? current.searchParams.get("tl") : null) || "en";
  let original = new URL(current);
  // Unwrap older links that accidentally sent an already translated URL to Google.
  for (let depth = 0; depth < 8 && isWrapper(original); depth++) {
    const source = original.searchParams.get("u");
    if (!source) throw new Error("The original website URL is missing from this translation.");
    const next = new URL(source);
    if (!/^https?:$/.test(next.protocol)) throw new Error("Unsupported website URL.");
    if (!next.hash) next.hash = original.hash;
    original = next;
  }
  if (isWrapper(original)) throw new Error("Unable to resolve the original website URL.");
  if (isProxy(original)) {
    // Google escapes source-domain hyphens as '--' and dots as '-'.
    const hostname = original.hostname.slice(0, -".translate.goog".length).replace(/--/g, "\u0000").replace(/-/g, ".").replace(/\u0000/g, "-");
    const protocol = original.searchParams.get("_x_tr_sch") === "http" ? "http:" : "https:";
    const source = new URL(`${protocol}//${hostname}${original.pathname}${original.search}${original.hash}`);
    for (const key of [...source.searchParams.keys()]) if (key.startsWith("_x_tr_")) source.searchParams.delete(key);
    original = source;
  }
  return { language, translated, originalUrl: original.href };
}

export function getTranslationDestination(href: string, language: string) {
  if (!/^[a-z]{2,3}(?:-[a-zA-Z]{2,8})*$/.test(language)) throw new Error("Invalid language code.");
  const context = getTranslationContext(href);
  if (language === "en" || language === "ta" || language === "si") {
    const original = new URL(context.originalUrl);
    if (language !== "en" || original.searchParams.has("lang")) original.searchParams.set("lang", language);
    return original.href;
  }
  const current = new URL(href);
  if (isProxy(current)) {
    // Stay on the same translated page; change its language instead of nesting proxies.
    current.searchParams.set("_x_tr_sl", "en");
    current.searchParams.set("_x_tr_tl", language);
    if (current.searchParams.has("lang")) current.searchParams.set("lang", "en");
    return current.href;
  }
  const target = new URL("https://translate.google.com/translate");
  const source = new URL(context.originalUrl);
  if (source.searchParams.has("lang")) source.searchParams.set("lang", "en");
  target.search = new URLSearchParams({ sl: "en", tl: language, hl: "en", u: source.href }).toString();
  return target.href;
}
