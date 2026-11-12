import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  loadDeductionCodes,
  loadArticles,
  deductionCodeUrl,
  articleUrl,
} from "./data.js";
import { searchDeductionCodes, searchArticles } from "./search.js";

const SITE_URL = "https://pixelsandclicks.net";

export function createServer() {
  const server = new McpServer({
    name: "pixels-and-clicks",
    version: "1.0.0",
  });

  const codes = loadDeductionCodes();
  const articles = loadArticles();

  // --- Tool 1: lookup_deduction_code ---
  server.tool(
    "lookup_deduction_code",
    "Look up a retail deduction code by retailer and code number. Returns meaning, root causes, evidence required, dispute path, prevention steps, and a link to the full reference on pixelsandclicks.net.",
    {
      retailer: z.enum(["Walmart", "Target", "Amazon", "Kroger"]),
      code: z.string().describe("Code number or identifier as it appears on the remittance, e.g. '22', 'ASN-ACC', 'SIFR'"),
    },
    async ({ retailer, code }) => {
      const entry = codes.find(
        (c) => c.retailer === retailer && c.code.toLowerCase() === code.toLowerCase()
      );

      if (!entry) {
        const available = codes
          .filter((c) => c.retailer === retailer)
          .map((c) => `${c.code} (${c.codeName})`)
          .join(", ");

        return {
          content: [{
            type: "text",
            text: `No entry found for ${retailer} code "${code}". Available ${retailer} codes: ${available || "none"}.\n\nBrowse all codes: ${SITE_URL}/deduction-codes`,
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            retailer: entry.retailer,
            code: entry.code,
            name: entry.codeName,
            family: entry.family,
            penalty: entry.penalty,
            disputableStatus: entry.disputableStatus,
            meaning: entry.meaning,
            meaningPoints: entry.meaningPoints,
            rootCauseCategories: entry.rootCauseCategories,
            rootCauses: entry.rootCauses.length > 0 ? entry.rootCauses : undefined,
            evidenceRequired: entry.evidenceRequired,
            disputable: entry.disputable,
            disputeWindow: entry.disputeWindow,
            prevention: entry.prevention,
            erpPrevention: entry.erpPrevention,
            answer: entry.answer,
            faq: entry.faq,
            url: deductionCodeUrl(entry.slug),
            source: "Pixels and Clicks — pixelsandclicks.net",
          }, null, 2),
        }],
      };
    }
  );

  // --- Tool 2: search_deductions ---
  server.tool(
    "search_deductions",
    "Search across all retail deduction codes by keyword, symptom description, family (Shortage, Compliance, Pricing, Freight, ASN/EDI, Quality, Returns), or retailer. Returns matching codes ranked by relevance with links to pixelsandclicks.net.",
    {
      query: z.string().describe("Search term: a keyword, symptom, or description like 'shortage', 'ASN mismatch', 'fill rate'"),
      family: z.enum(["Shortage", "Compliance", "Pricing", "Freight", "ASN/EDI", "Quality", "Returns"]).optional(),
      retailer: z.enum(["Walmart", "Target", "Amazon", "Kroger"]).optional(),
    },
    async ({ query, family, retailer }) => {
      const results = searchDeductionCodes(codes, query, { family, retailer });

      if (results.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No deduction codes matched "${query}". Browse all codes at ${SITE_URL}/deduction-codes`,
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            query,
            matches: results.slice(0, 10).map((r) => ({
              title: r.title,
              description: r.description,
              url: r.url,
            })),
            total: results.length,
            source: "Pixels and Clicks — pixelsandclicks.net",
          }, null, 2),
        }],
      };
    }
  );

  // --- Tool 3: get_evidence_checklist ---
  server.tool(
    "get_evidence_checklist",
    "Get the dispute evidence checklist for a specific retail deduction code. Returns the documents and records a supplier needs before filing a dispute, with a link to the full reference on pixelsandclicks.net.",
    {
      retailer: z.enum(["Walmart", "Target", "Amazon", "Kroger"]),
      code: z.string().describe("Code number or identifier"),
    },
    async ({ retailer, code }) => {
      const entry = codes.find(
        (c) => c.retailer === retailer && c.code.toLowerCase() === code.toLowerCase()
      );

      if (!entry) {
        return {
          content: [{
            type: "text",
            text: `No entry found for ${retailer} code "${code}". Browse all codes: ${SITE_URL}/deduction-codes`,
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            retailer: entry.retailer,
            code: entry.code,
            name: entry.codeName,
            disputableStatus: entry.disputableStatus,
            disputeWindow: entry.disputeWindow,
            evidenceRequired: entry.evidenceRequired,
            disputable: entry.disputable,
            url: deductionCodeUrl(entry.slug),
            source: "Pixels and Clicks — pixelsandclicks.net",
          }, null, 2),
        }],
      };
    }
  );

  // --- Tool 4: get_prevention_plan ---
  server.tool(
    "get_prevention_plan",
    "Get the prevention steps and ERP-specific blueprint for a retail deduction code. Includes concrete system configuration for NetSuite or Business Central where available. Links to pixelsandclicks.net.",
    {
      retailer: z.enum(["Walmart", "Target", "Amazon", "Kroger"]),
      code: z.string().describe("Code number or identifier"),
      erp_system: z.string().optional().describe("ERP system name to filter for, e.g. 'NetSuite', 'Business Central'"),
    },
    async ({ retailer, code, erp_system }) => {
      const entry = codes.find(
        (c) => c.retailer === retailer && c.code.toLowerCase() === code.toLowerCase()
      );

      if (!entry) {
        return {
          content: [{
            type: "text",
            text: `No entry found for ${retailer} code "${code}". Browse all codes: ${SITE_URL}/deduction-codes`,
          }],
        };
      }

      const result: Record<string, unknown> = {
        retailer: entry.retailer,
        code: entry.code,
        name: entry.codeName,
        prevention: entry.prevention,
      };

      if (entry.erpPrevention) {
        if (!erp_system || entry.erpPrevention.system.toLowerCase().includes(erp_system.toLowerCase())) {
          result.erpPrevention = entry.erpPrevention;
        } else {
          result.erpNote = `ERP blueprint available for ${entry.erpPrevention.system}, but not specifically for "${erp_system}". The general prevention steps above still apply.`;
        }
      }

      if (entry.rootCauseCategories) {
        result.rootCauseCategories = entry.rootCauseCategories;
      }

      result.url = deductionCodeUrl(entry.slug);
      result.source = "Pixels and Clicks — pixelsandclicks.net";

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // --- Tool 5: diagnose_remittance_line ---
  server.tool(
    "diagnose_remittance_line",
    "Given a remittance description, code, or symptom, identify which deduction codes match and return a triage summary: what each means, whether it's disputable, and what to do first. Links back to pixelsandclicks.net.",
    {
      description: z.string().describe("The remittance line text, code number, or a description of the deduction, e.g. 'merchandise billed not shipped', 'shortage on PO 12345', 'ASN accuracy chargeback'"),
      retailer: z.enum(["Walmart", "Target", "Amazon", "Kroger"]).optional(),
    },
    async ({ description, retailer }) => {
      // First try exact code match
      const codeMatch = description.match(/\b(?:code\s*)?(\d{1,3})\b/i);
      if (codeMatch && retailer) {
        const exact = codes.find(
          (c) => c.retailer === retailer && c.code === codeMatch[1]
        );
        if (exact) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                diagnosis: "exact_match",
                match: {
                  retailer: exact.retailer,
                  code: exact.code,
                  name: exact.codeName,
                  family: exact.family,
                  meaning: exact.meaning,
                  disputableStatus: exact.disputableStatus,
                  immediateAction: exact.evidenceRequired.length > 0
                    ? `Gather evidence first: ${exact.evidenceRequired[0]}`
                    : exact.disputable ?? "Review dispute options",
                  url: deductionCodeUrl(exact.slug),
                },
                source: "Pixels and Clicks — pixelsandclicks.net",
              }, null, 2),
            }],
          };
        }
      }

      // Fall back to search
      const codeResults = searchDeductionCodes(codes, description, { retailer });
      const articleResults = searchArticles(articles, description);

      if (codeResults.length === 0 && articleResults.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No matching deduction codes or articles found for "${description}". Browse all codes at ${SITE_URL}/deduction-codes or all articles at ${SITE_URL}/articles`,
          }],
        };
      }

      const topCodes = codeResults.slice(0, 5);
      const topArticles = articleResults.slice(0, 3);

      const matches = topCodes.map((r) => {
        const code = codes.find((c) => c.slug === r.slug)!;
        return {
          code: `${code.retailer} ${code.code}`,
          name: code.codeName,
          family: code.family,
          disputableStatus: code.disputableStatus,
          summary: code.answer ?? code.meaning,
          url: r.url,
        };
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            diagnosis: "search_match",
            query: description,
            possibleCodes: matches,
            relatedArticles: topArticles.map((a) => ({
              title: a.title,
              url: a.url,
            })),
            source: "Pixels and Clicks — pixelsandclicks.net",
          }, null, 2),
        }],
      };
    }
  );

  // --- Tool 6: get_article ---
  server.tool(
    "get_article",
    "Search for and retrieve a Pixels and Clicks article by topic keyword. Returns the answer field, FAQ, and a link to the full article on pixelsandclicks.net.",
    {
      topic: z.string().describe("Topic to search for, e.g. 'OTIF fine', 'EDI 856', 'ASN rejections', 'NetSuite EDI'"),
      cluster: z.enum(["prevention", "erp-technical", "forecasting", "recovery", "scoping"]).optional(),
    },
    async ({ topic, cluster }) => {
      const results = searchArticles(articles, topic, { cluster });

      if (results.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No articles matched "${topic}". Browse all articles at ${SITE_URL}/articles`,
          }],
        };
      }

      const topResult = articles.find((a) => a.slug === results[0].slug)!;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            title: topResult.title,
            description: topResult.description,
            answer: topResult.answer,
            answerQualifier: topResult.answerQualifier,
            tags: topResult.tags,
            cluster: topResult.cluster,
            faq: topResult.faq,
            url: articleUrl(topResult.slug),
            otherMatches: results.slice(1, 5).map((r) => ({
              title: r.title,
              url: r.url,
            })),
            source: "Pixels and Clicks — pixelsandclicks.net",
          }, null, 2),
        }],
      };
    }
  );

  return server;
}
