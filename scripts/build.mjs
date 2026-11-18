import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function fail(code, message) {
  console.error(`Error: [BM_BUILD_${code}] ${message}`);
  process.exitCode = 1;
}

function runStep(code, label, file, args = []) {
  console.log(`[BM BUILD] ${label}`);
  return new Promise((resolve) => {
    // Use the current Node executable and no shell on Windows or Linux.
    const child = spawn(process.execPath, [file, ...args], {
      cwd: root,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let tail = "";
    let spawnFailed = false;
    const forward = (stream, output) => {
      stream.on("data", (chunk) => {
        output.write(chunk);
        tail = (tail + chunk.toString()).slice(-16384);
      });
    };
    forward(child.stdout, process.stdout);
    forward(child.stderr, process.stderr);
    child.on("error", (error) => {
      spawnFailed = true;
      fail(code, `${label} tidak dapat dimulai: ${error.message}`);
    });
    child.on("close", (status, signal) => {
      if (spawnFailed) return resolve(false);
      if (status === 0) return resolve(true);
      fail(
        code,
        `${label} gagal (exit=${status ?? "null"}, signal=${signal ?? "none"}).`,
      );
      const details = tail
        .split(/\r?\n/)
        .filter((line) =>
          /(?:Type error:|Module not found|Cannot find|File wajib|Error:|Error \[)/i.test(
            line,
          ),
        )
        .slice(-3);
      for (const line of details) {
        console.error(`Error: [BM_BUILD_DETAIL] ${line.trim().slice(0, 800)}`);
      }
      console.error(
        `Error: [BM_BUILD_LOG] Salin log lengkap tahap "${label}", termasuk baris sebelum pesan ini.`,
      );
      resolve(false);
    });
  });
}

async function main() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  console.log(
    `[BM BUILD] BM Screeners ${manifest.version} | Node ${process.version}`,
  );
  if (Number(process.versions.node.split(".")[0]) !== 24) {
    fail(
      "NODE",
      "Paket ini menggunakan Node.js 24.x. Pilih Node.js 24.x pada pengaturan proyek Vercel.",
    );
    return;
  }
  for (const dependency of ["typescript", "next", "@tailwindcss/postcss"]) {
    try {
      require.resolve(dependency);
    } catch {
      fail(
        "DEPENDENCY",
        `Paket ${dependency} tidak ditemukan. Gunakan Install Command: npm ci --include=dev, lalu deploy ulang.`,
      );
      return;
    }
  }
  const checkFile = path.join(root, "scripts/check-project.mjs");
  if (!fs.existsSync(checkFile)) {
    fail(
      "SOURCE",
      "scripts/check-project.mjs tidak ditemukan. Unggah seluruh folder scripts dari ZIP.",
    );
    return;
  }
  if (!(await runStep("SOURCE", "1/2 Pemeriksaan source", checkFile))) return;
  const nextCLI = require.resolve("next/dist/bin/next");
  if (
    !(await runStep("NEXT", "2/2 Kompilasi Next.js", nextCLI, [
      "build",
      ...process.argv.slice(2),
    ]))
  )
    return;
  console.log(
    "[BM BUILD] SELESAI: pemeriksaan source dan build Next.js berhasil.",
  );
}

main().catch((error) => {
  fail("SETUP", error instanceof Error ? error.message : String(error));
});
