import assert from "node:assert/strict";
import { getTranslationContext, getTranslationDestination } from "../lib/translation-navigation.ts";

const original = "https://muhthaseem.github.io/AlShehza_NGO_WebsiteV2/?campaign=water#work";
const tamil = "https://muhthaseem-github-io.translate.goog/AlShehza_NGO_WebsiteV2/?campaign=water&_x_tr_sl=en&_x_tr_tl=ta&_x_tr_hl=en#work";

const first = new URL(getTranslationDestination(original, "ta"));
assert.equal(first.hostname, "translate.google.com");
assert.equal(first.searchParams.get("tl"), "ta");
assert.equal(first.searchParams.get("u"), original);

const sinhala = new URL(getTranslationDestination(tamil, "si"));
assert.equal(sinhala.hostname, "muhthaseem-github-io.translate.goog");
assert.equal(sinhala.pathname, "/AlShehza_NGO_WebsiteV2/");
assert.equal(sinhala.searchParams.get("_x_tr_tl"), "si");
assert.equal(sinhala.searchParams.get("campaign"), "water");
assert.equal(sinhala.hash, "#work");
assert.equal(sinhala.searchParams.has("u"), false);
assert.equal(getTranslationDestination(tamil, "en"), original);
assert.equal(getTranslationContext(sinhala.href).language, "si");

const arabic = new URL(getTranslationDestination(first.href, "ar"));
assert.equal(arabic.searchParams.get("tl"), "ar");
assert.equal(arabic.searchParams.get("u"), original);
assert.equal(getTranslationDestination(arabic.href, "en"), original);

const custom = "https://www-al--shehza-org.translate.goog/projects/?ref=contact&_x_tr_sl=en&_x_tr_tl=ar#contact";
assert.equal(getTranslationDestination(custom, "en"), "https://www.al-shehza.org/projects/?ref=contact#contact");
const nested = new URL("https://translate.google.com/translate");
nested.search = new URLSearchParams({ tl: "ar", u: first.href }).toString();
assert.equal(new URL(getTranslationDestination(nested.href, "fr")).searchParams.get("u"), original);
assert.throws(() => getTranslationDestination(original, "invalid/language"));
console.log("Passed: original-to-translation, translated-to-translated, return-to-English, wrapper switching, escaped domains, nested URL recovery, and language validation.");
