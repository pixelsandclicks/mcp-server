import { deductionCodeUrl, articleUrl } from "./data.js";
function tokenize(text) {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
}
function scoreMatch(text, queryTokens) {
    const lower = text.toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
        if (lower.includes(token)) {
            score += 1;
            // Bonus for exact word boundary match
            if (new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower)) {
                score += 0.5;
            }
        }
    }
    return score;
}
export function searchDeductionCodes(codes, query, filters) {
    const queryTokens = tokenize(query);
    let filtered = codes;
    if (filters?.family) {
        filtered = filtered.filter(c => c.family?.toLowerCase() === filters.family.toLowerCase());
    }
    if (filters?.retailer) {
        filtered = filtered.filter(c => c.retailer.toLowerCase() === filters.retailer.toLowerCase());
    }
    return filtered
        .map(code => {
        const searchableText = [
            code.title,
            code.codeName,
            code.code,
            code.description,
            code.meaning,
            code.answer ?? "",
            code.family ?? "",
            ...(code.meaningPoints ?? []),
            ...(code.prevention),
        ].join(" ");
        let relevance = scoreMatch(searchableText, queryTokens);
        // Title and code-name matches are more likely what the user wants
        relevance += scoreMatch(code.title, queryTokens) * 2;
        relevance += scoreMatch(code.codeName, queryTokens) * 1.5;
        return {
            type: "deduction_code",
            slug: code.slug,
            title: code.title,
            description: code.description,
            relevance,
            url: deductionCodeUrl(code.slug),
        };
    })
        .filter(r => r.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);
}
export function searchArticles(articles, query, filters) {
    const queryTokens = tokenize(query);
    let filtered = articles;
    if (filters?.cluster) {
        filtered = filtered.filter(a => a.cluster?.toLowerCase() === filters.cluster.toLowerCase());
    }
    return filtered
        .map(article => {
        const searchableText = [
            article.title,
            article.description,
            article.answer ?? "",
            article.tags.join(" "),
            ...(article.faq.map(f => `${f.q} ${f.a}`)),
        ].join(" ");
        let relevance = scoreMatch(searchableText, queryTokens);
        // Title matches are more likely what the user wants
        relevance += scoreMatch(article.title, queryTokens) * 2;
        return {
            type: "article",
            slug: article.slug,
            title: article.title,
            description: article.description,
            relevance,
            url: articleUrl(article.slug),
        };
    })
        .filter(r => r.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);
}
