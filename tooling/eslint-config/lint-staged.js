import { execSync } from "node:child_process";
import { resolve, relative, dirname } from "node:path";
import { existsSync } from "node:fs";

const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

const groups = {};

for (const file of files) {
  let dir = dirname(resolve(file));
  while (dir !== "/" && !existsSync(resolve(dir, "package.json"))) {
    dir = dirname(dir);
  }

  if (dir === "/") {
    continue;
  }

  if (!groups[dir]) {
    groups[dir] = [];
  }

  groups[dir].push(relative(dir, resolve(file)));
}

let failed = false;

for (const [dir, pkgFiles] of Object.entries(groups)) {
  const hasConfig =
    existsSync(resolve(dir, "eslint.config.js")) ||
    existsSync(resolve(dir, "eslint.config.mjs")) ||
    existsSync(resolve(dir, "eslint.config.cjs"));

  if (!hasConfig) {
    continue;
  }

  const filesArgs = pkgFiles.map((f) => `"${f}"`).join(" ");
  try {
    console.log(`Running eslint in ${relative(process.cwd(), dir)}...`);
    execSync(`bunx eslint --fix ${filesArgs}`, {
      cwd: dir,
      stdio: "inherit",
    });
  } catch {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
