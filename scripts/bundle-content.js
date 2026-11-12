#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const repoRoot = path.resolve(import.meta.dirname, "..", "..", "..");
const contentDir = path.join(repoRoot, "src", "content");
const outDir = path.join(import.meta.dirname, "..", "dist", "data");

if (!fs.existsSync(contentDir)) {
  console.error("Content directory not found:", contentDir);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function loadDir(subdir) {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data } = matter(raw);
      const slug = path.basename(filename, path.extname(filename));
      return { slug, ...data };
    })
    .filter((d) => !d.draft);
}

const codes = loadDir("deductionCodes");
const articles = loadDir("articles");

fs.writeFileSync(path.join(outDir, "codes.json"), JSON.stringify(codes, null, 2));
fs.writeFileSync(path.join(outDir, "articles.json"), JSON.stringify(articles, null, 2));

console.log(`Bundled ${codes.length} deduction codes and ${articles.length} articles into dist/data/`);
