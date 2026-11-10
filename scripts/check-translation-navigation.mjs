import assert from "node:assert/strict";
import { getTranslationContext, getTranslationDestination } from "../lib/translation-navigation.ts";
import { translateText, translationEntries } from "../lib/local-translations.ts";

const original = "https://muhthaseem.github.io/AlShehza_NGO_WebsiteV2/?campaign=water#work";
const proxy = "https://muhthaseem-github-io.translate.goog/AlShehza_NGO_WebsiteV2/?campaign=water&_x_tr_sl=en&_x_tr_tl=ar&_x_tr_hl=en#work";
for (const language of ["ta", "si"]) {
  const local = new URL(getTranslationDestination(original, language));
  assert.equal(local.hostname, "muhthaseem.github.io");
  assert.equal(local.searchParams.get("lang"), language);
  assert.equal(local.hash, "#work");
  const fromGoogle = new URL(getTranslationDestination(proxy, language));
  assert.equal(fromGoogle.hostname, "muhthaseem.github.io");
  assert.equal(fromGoogle.searchParams.get("lang"), language);
  assert.equal(fromGoogle.searchParams.get("campaign"), "water");
}
const first = new URL(getTranslationDestination(original, "hi"));
assert.equal(first.hostname, "translate.google.com");
assert.equal(first.searchParams.get("tl"), "hi");
assert.equal(first.searchParams.get("u"), original);
const french = new URL(getTranslationDestination(proxy, "fr"));
assert.equal(french.hostname, "muhthaseem-github-io.translate.goog");
assert.equal(french.searchParams.get("_x_tr_tl"), "fr");
assert.equal(french.searchParams.has("u"), false);
assert.equal(getTranslationContext(french.href).language, "fr");
assert.equal(getTranslationDestination(proxy, "en"), original);
const tamilSource = new URL(original); tamilSource.searchParams.set("lang", "ta");
const other = new URL(getTranslationDestination(tamilSource.href, "ar"));
assert.equal(new URL(other.searchParams.get("u")).searchParams.get("lang"), "en");
const custom = "https://www-al--shehza-org.translate.goog/projects/?ref=contact&_x_tr_sl=en&_x_tr_tl=ar#contact";
assert.equal(getTranslationDestination(custom, "en"), "https://www.al-shehza.org/projects/?ref=contact#contact");
const nested = new URL("https://translate.google.com/translate");
nested.search = new URLSearchParams({ tl: "ar", u: first.href }).toString();
assert.equal(new URL(getTranslationDestination(nested.href, "de")).searchParams.get("u"), original);
assert.throws(() => getTranslationDestination(original, "invalid/language"));
for (const [en, ta, si] of translationEntries) {
  assert.ok(ta.trim() && si.trim(), `Missing translation: ${en}`);
  assert.notEqual(translateText(en, "ta"), en, `Tamil fallback: ${en}`);
  assert.notEqual(translateText(en, "si"), en, `Sinhala fallback: ${en}`);
  assert.equal(translateText(en, "en"), en);
}
console.log(`Passed: ${translationEntries.length} bilingual entries, native-language URLs, Google language switching, source-language reset, preserved sections, English return, and nested URL recovery.`);
