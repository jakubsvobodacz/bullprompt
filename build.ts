#!/usr/bin/env tsx

import { execSync } from "child_process";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const srcDir = "./src";
const distDir = "./dist";

function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const files = readdirSync(src);

  for (const file of files) {
    const srcFile = join(src, file);
    const destFile = join(dest, file);

    if (statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      copyFileSync(srcFile, destFile);
    }
  }
}

function build() {
  console.log("🔨 Building Chrome Extension...");

  // Clean dist directory
  if (existsSync(distDir)) {
    execSync(`rm -rf ${distDir}`);
  }

  // Create dist directory
  mkdirSync(distDir, { recursive: true });

  // Build TypeScript files
  console.log("📦 Compiling TypeScript...");

  // Compile background script
  execSync(
    "npx tsc src/background.ts --outDir dist --target ES2020 --module ES2020 --moduleResolution node --skipLibCheck",
    { stdio: "inherit" }
  );

  // Compile popup script
  execSync(
    "npx tsc src/popup.ts --outDir dist --target ES2020 --module ES2020 --moduleResolution node --skipLibCheck",
    { stdio: "inherit" }
  );

  // Compile storage service
  execSync(
    "npx tsc src/chrome-storage-service.ts --outDir dist --target ES2020 --module ES2020 --moduleResolution node --skipLibCheck",
    { stdio: "inherit" }
  );

  // Compile types
  execSync(
    "npx tsc src/types.ts --outDir dist --target ES2020 --module ES2020 --moduleResolution node --skipLibCheck",
    { stdio: "inherit" }
  );

  // Copy static files
  console.log("📁 Copying static files...");
  copyFileSync(join(srcDir, "manifest.json"), join(distDir, "manifest.json"));
  copyFileSync(join(srcDir, "popup.html"), join(distDir, "popup.html"));
  copyFileSync(join(srcDir, "popup.css"), join(distDir, "popup.css"));

  // Copy icons if they exist
  if (existsSync(join(srcDir, "icons"))) {
    copyDir(join(srcDir, "icons"), join(distDir, "icons"));
  }

  console.log("✅ Build completed successfully!");
  console.log("📂 Extension files are in ./dist directory");
}

build();
