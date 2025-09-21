import { CompanyKPIs } from "../types";

export function normalizeKPI(apiData: any): CompanyKPIs {
  return {
    companyName: apiData.companyName || "N/A",
    sector: apiData.sector || "N/A",
    fundingStage: apiData.fundingStage || "N/A",
    fundingRound: apiData.fundingRound || "N/A",
    askAmount: apiData.fundingRequest || apiData.askAmount || "N/A",
    valuation: apiData.valuation || "N/A",
    revenue: apiData.revenue || "N/A",
    growthRate: apiData.traction || "N/A",
    teamSize: apiData.teamSize || "N/A",
    marketSize: apiData.marketSize
      ? typeof apiData.marketSize === "object"
        ? Object.entries(apiData.marketSize)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")
        : apiData.marketSize
      : "N/A",
    customerCount: apiData.customers || "N/A",
    burnRate: apiData.burnRate || "N/A",
    businessModel: apiData.businessModel || "N/A",
    keyMetrics: Array.isArray(apiData.keyMetrics)
      ? apiData.keyMetrics.join("; ")
      : apiData.keyMetrics || "N/A",
    fundingRequest: apiData.fundingRequest || "N/A",
    useOfFunds: apiData.useOfFunds || "N/A",
    traction: apiData.traction || "N/A",
    technology: apiData.technology || "N/A",
    competition: Array.isArray(apiData.competition)
      ? apiData.competition.join(", ")
      : apiData.competition || "N/A",
    geographicMarket: apiData.geographicMarket || "N/A",
  };
}
