import type { DeductionCode, Article } from "./types.js";
export declare function loadDeductionCodes(): DeductionCode[];
export declare function loadArticles(): Article[];
export declare function deductionCodeUrl(slug: string): string;
export declare function articleUrl(slug: string): string;
