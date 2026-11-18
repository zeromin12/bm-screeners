import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = new Set();

// Compare each directory entry so a Windows upload cannot hide a casing error.
function exactFile(file) {
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  let current = root;
  for (const name of relative.split(path.sep)) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory())
      return false;
    if (!fs.readdirSync(current).includes(name)) return false;
    current = path.join(current, name);
  }
  return fs.existsSync(current) && fs.statSync(current).isFile();
}

const required = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/auth/confirm/route.ts",
  "src/app/auth/callback/route.ts",
  "src/lib/supabase/server.ts",
  "src/lib/supabase/client.ts",
];
for (const name of required) {
  if (!exactFile(path.join(root, name)))
    errors.add(`File wajib tidak ditemukan: ${name}`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(file)
      : /\.tsx?$/.test(file)
        ? [file]
        : [];
  });
}

let checked = 0;
for (const file of walk(path.join(root, "src"))) {
  const source = fs.readFileSync(file, "utf8");
  for (const ref of ts.preProcessFile(source, true, true).importedFiles) {
    const specifier = ref.fileName;
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
    checked++;
    const base = specifier.startsWith("@/")
      ? path.join(root, "src", specifier.slice(2))
      : path.resolve(path.dirname(file), specifier);
    const candidates = [
      "",
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".json",
      "/index.ts",
      "/index.tsx",
    ];
    if (!candidates.some((suffix) => exactFile(base + suffix))) {
      errors.add(
        `${path.relative(root, file)}: import ${specifier} tidak ditemukan (cek huruf besar/kecil).`,
      );
    }
  }
}

if (errors.size) {
  console.error(
    "\nError: [BM_BUILD_SOURCE] Struktur source belum lengkap. Build dihentikan.",
  );
  for (const error of errors) console.error(`Error: [BM_SOURCE_FILE] ${error}`);
  console.error(
    "Unggah kembali isi ZIP lengkap, termasuk src/lib. Root Directory harus berisi package.json, tsconfig.json, dan src.",
  );
  process.exitCode = 1;
} else {
  console.log(
    `BM Screeners: file wajib lengkap dan ${checked} import lokal valid.`,
  );
}
