import { CompanyKPIs } from "../types";

export function normalizeKPI(apiData: Partial<Record<string, unknown>>): CompanyKPIs {
  return {
    companyName: (apiData.companyName as string) || "N/A",
    sector: (apiData.sector as string) || "N/A",
    fundingStage: (apiData.fundingStage as string) || "N/A",
    fundingRound: (apiData.fundingRound as string) || "N/A",
    askAmount: (apiData.fundingRequest as string) || (apiData.askAmount as string) || "N/A",
    valuation: (apiData.valuation as string) || "N/A",
    revenue: (apiData.revenue as string) || "N/A",
    growthRate: (apiData.traction as string) || "N/A",
    teamSize: (apiData.teamSize as string) || "N/A",
    marketSize: apiData.marketSize
      ? (typeof apiData.marketSize === "object"
        ? Object.entries(apiData.marketSize as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")
        : String(apiData.marketSize))
      : "N/A",
    customerCount: (apiData.customers as string) || "N/A",
    burnRate: (apiData.burnRate as string) || "N/A",
    businessModel: (apiData.businessModel as string) || "N/A",
    keyMetrics: Array.isArray(apiData.keyMetrics)
      ? (apiData.keyMetrics as string[]).join("; ")
      : (apiData.keyMetrics as string) || "N/A",
    fundingRequest: (apiData.fundingRequest as string) || "N/A",
    useOfFunds: (apiData.useOfFunds as string) || "N/A",
    traction: (apiData.traction as string) || "N/A",
    technology: (apiData.technology as string) || "N/A",
    competition: Array.isArray(apiData.competition)
      ? (apiData.competition as string[]).join(", ")
      : (apiData.competition as string) || "N/A",
    geographicMarket: (apiData.geographicMarket as string) || "N/A",
  };
}
