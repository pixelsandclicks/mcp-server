export interface DeductionCode {
  slug: string;
  retailer: "Walmart" | "Target" | "Kroger" | "Amazon";
  code: string;
  codeName: string;
  title: string;
  description: string;
  draft: boolean;
  family?: string;
  penalty?: string;
  disputableStatus?: string;
  answer?: string;
  answerQualifier?: string;
  meaning: string;
  meaningPoints?: string[];
  rootCauses: string[];
  rootCauseCategories?: {
    physical?: string;
    carrier?: string;
    erp?: string;
  };
  evidenceRequired: string[];
  disputable?: string;
  disputeWindow?: string;
  prevention: string[];
  erpPrevention?: {
    system: string;
    blueprint: string;
  };
  faq: Array<{ q: string; a: string }>;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  cluster?: string;
  draft: boolean;
  answer?: string;
  answerQualifier?: string;
  faq: Array<{ q: string; a: string }>;
}

export interface SearchResult {
  type: "deduction_code" | "article";
  slug: string;
  title: string;
  description: string;
  relevance: number;
  url: string;
}
