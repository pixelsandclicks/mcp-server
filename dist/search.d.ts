import type { DeductionCode, Article, SearchResult } from "./types.js";
export declare function searchDeductionCodes(codes: DeductionCode[], query: string, filters?: {
    family?: string;
    retailer?: string;
}): SearchResult[];
export declare function searchArticles(articles: Article[], query: string, filters?: {
    cluster?: string;
}): SearchResult[];
