import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { DeductionCode, Article } from "./types.js";

const SITE_URL = "https://pixelsandclicks.net";

function tryBundledJson<T>(filename: string): T[] | null {
  const bundled = path.resolve(import.meta.dirname, "data", filename);
  if (fs.existsSync(bundled)) {
    return JSON.parse(fs.readFileSync(bundled, "utf-8")) as T[];
  }
  return null;
}

function findContentDir(): string | null {
  let dir = path.resolve(import.meta.dirname, "..");
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "src", "content");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

function slugFromFilename(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

function loadCodesFromMarkdown(contentDir: string): DeductionCode[] {
  const require = createRequire(import.meta.url);
  const matter = require("gray-matter");
  const codesDir = path.join(contentDir, "deductionCodes");
  if (!fs.existsSync(codesDir)) return [];

  return fs.readdirSync(codesDir)
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(filename => {
      const raw = fs.readFileSync(path.join(codesDir, filename), "utf-8");
      const { data } = matter(raw);
      const slug = slugFromFilename(filename);
      return {
        slug,
        retailer: data.retailer,
        code: data.code,
        codeName: data.codeName,
        title: data.title,
        description: data.description,
        draft: data.draft ?? false,
        family: data.family,
        penalty: data.penalty,
        disputableStatus: data.disputableStatus,
        answer: data.answer,
        answerQualifier: data.answerQualifier,
        meaning: data.meaning,
        meaningPoints: data.meaningPoints,
        rootCauses: data.rootCauses ?? [],
        rootCauseCategories: data.rootCauseCategories,
        evidenceRequired: data.evidenceRequired ?? [],
        disputable: data.disputable,
        disputeWindow: data.disputeWindow,
        prevention: data.prevention ?? [],
        erpPrevention: data.erpPrevention,
        faq: data.faq ?? [],
      } as DeductionCode;
    })
    .filter(c => !c.draft);
}

function loadArticlesFromMarkdown(contentDir: string): Article[] {
  const require = createRequire(import.meta.url);
  const matter = require("gray-matter");
  const articlesDir = path.join(contentDir, "articles");
  if (!fs.existsSync(articlesDir)) return [];

  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(filename => {
      const raw = fs.readFileSync(path.join(articlesDir, filename), "utf-8");
      const { data } = matter(raw);
      const slug = slugFromFilename(filename);
      return {
        slug,
        title: data.title,
        description: data.description,
        author: data.author ?? "Pixels and Clicks",
        tags: data.tags ?? [],
        cluster: data.cluster,
        draft: data.draft ?? false,
        answer: data.answer,
        answerQualifier: data.answerQualifier,
        faq: data.faq ?? [],
      } as Article;
    })
    .filter(a => !a.draft);
}

export function loadDeductionCodes(): DeductionCode[] {
  const bundled = tryBundledJson<DeductionCode>("codes.json");
  if (bundled) {
    return bundled
      .filter(c => !c.draft)
      .map(c => ({
        ...c,
        rootCauses: c.rootCauses ?? [],
        evidenceRequired: c.evidenceRequired ?? [],
        prevention: c.prevention ?? [],
        faq: c.faq ?? [],
      }));
  }
  const contentDir = findContentDir();
  if (!contentDir) return [];
  return loadCodesFromMarkdown(contentDir);
}

export function loadArticles(): Article[] {
  const bundled = tryBundledJson<Article>("articles.json");
  if (bundled) {
    return bundled
      .filter(a => !a.draft)
      .map(a => ({
        ...a,
        author: a.author ?? "Pixels and Clicks",
        tags: a.tags ?? [],
        faq: a.faq ?? [],
      }));
  }
  const contentDir = findContentDir();
  if (!contentDir) return [];
  return loadArticlesFromMarkdown(contentDir);
}

export function deductionCodeUrl(slug: string): string {
  return `${SITE_URL}/deduction-codes/${slug}`;
}

export function articleUrl(slug: string): string {
  return `${SITE_URL}/articles/${slug}`;
}
