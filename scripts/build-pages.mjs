import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/") || basePath.includes(".."))) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must be empty or a path such as /AlShehza_NGO_WebsiteV2 (no trailing slash).");
}
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "1", NEXT_PUBLIC_BASE_PATH: basePath, NEXT_TELEMETRY_DISABLED: "1" },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync("out/.nojekyll", "");
