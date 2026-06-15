export interface Industry {
  id: string;
  name: string;
  description: string;
}

export interface BusinessFunction {
  id: string;
  name: string;
  description: string;
}

/** BSN / Varsity Brands preset — default for current engagement. */
export const BSN_PRESET = {
  companyName: "Varsity Brands / BSN Sports",
  industryId: "sports_apparel",
  functionId: "sales_support",
} as const;

export const INDUSTRIES: Industry[] = [
  {
    id: "sports_apparel",
    name: "Sports & Apparel / Retail",
    description: "Team sports, apparel, decorated goods, DTC/team sales",
  },
  {
    id: "retail_consumer",
    name: "Retail & Consumer",
    description: "B2C/B2B retail, e-commerce, consumer products",
  },
  {
    id: "financial_services",
    name: "Financial Services",
    description: "Banking, insurance, payments, lending",
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrials",
    description: "Production, supply chain, plant operations",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Providers, payers, life sciences operations",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Software, platforms, IT operations",
  },
  {
    id: "other",
    name: "Other / Cross-industry",
    description: "Generic diagnostic templates",
  },
];

export const FUNCTIONS: BusinessFunction[] = [
  {
    id: "sales_support",
    name: "Sales Support & Operations",
    description: "Order support, quotes, fulfillment coordination",
  },
  {
    id: "customer_service",
    name: "Customer Service",
    description: "Issue resolution, WISMO, complaints, retention",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    description: "AR, AP, credit, billing, collections",
  },
  {
    id: "supply_chain",
    name: "Supply Chain & Procurement",
    description: "Sourcing, purchasing, vendor management, logistics",
  },
  {
    id: "hr",
    name: "HR & People Operations",
    description: "Talent, onboarding, workforce planning",
  },
  {
    id: "it",
    name: "IT & Technology",
    description: "Systems, integrations, support desks",
  },
  {
    id: "general_ops",
    name: "General Operations",
    description: "Cross-functional ops and back-office",
  },
];

export function getIndustry(id: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.id === id);
}

export function getFunction(id: string): BusinessFunction | undefined {
  return FUNCTIONS.find((f) => f.id === id);
}

/** Use BSN-specific seed catalog when engagement matches VB diagnostic context. */
export function useBsnCatalog(industryId: string, functionId: string): boolean {
  return (
    industryId === "sports_apparel" &&
    (functionId === "sales_support" || functionId === "customer_service")
  );
}

export interface EngagementContext {
  companyName: string;
  industryId: string;
  functionId: string;
}

export function getEngagementLabel(ctx: EngagementContext): string {
  const industry = getIndustry(ctx.industryId)?.name ?? ctx.industryId;
  const fn = getFunction(ctx.functionId)?.name ?? ctx.functionId;
  return `${ctx.companyName} · ${industry} · ${fn}`;
}
