/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OrderItem {
  image: string;
  styleName: string;
  styleNumber: string;
  colorName: string;
  colorCode: string;
  size: string;
  sizeCode: string;
  currencyCode: string;
  priceLabel: string;
  minWholesalePrice: number;
  maxWholesalePrice: number;
  minRetailPrice: number;
  maxRetailPrice: number;
  units: number;
  originalExtWholesale: number;
  extendedWholesale: number;
  extendedRetail: number;
  retailer: string;
  status: string;
  category: string;
  subcategory: string;
  linesheet: string;
  orderType: string;
  createdDate: string;
  fabricationName: string;
  fabricationCode: string;
  silhouetteName: string;
  silhouetteCode: string;
  measurements: string;
  countryOfOrigin: string;
  badges: string;
  styleTags: string;
  productUPC: string;
  poNumber: string;
  door: string;
  city: string;
  state: string;
  country: string;
  address: string;
  startShip: string;
  completeShip: string;
  customerCode: string;
  buyerName: string;
  buyerEmail: string;
  divisions: string;
}

export interface SellOutItem {
  styleName: string;
  colorCode: string;
  size: string;
  unitsSold: number;
  retailPrice: number;
  soldDate?: string;
  door?: string;
}

export interface MergedProduct {
  id: string; // e.g. "FAGGI_3331"
  styleName: string;
  styleClean: string;
  styleNumber: string;
  color: string;
  colorCode: string;
  colorPrefix: string;
  silhouette: string;
  fabrication: string;
  fabricationCode?: string;
  image: string;
  linesheet: string;
  wholesaleEur: number;
  suggRetailEur: number;
  unitsOrdered: number;
  unitsSold: number;
  stockRemaining: number;
  sellOutPct: number;
  totalWholesaleEur: number;
  totalRetailEur: number;
  realizedRevenueEur: number;
  markup: number;
  poNumbers: string[];
  sizesOrdered: Record<string, number>;
  sizesSold: Record<string, number>;
  countryOfOrigin: string;
  retailer: string;
  door: string;
  startShip: string;
  completeShip: string;
  category: string;
  subcategory: string;
  styleTags: string;
}

export interface BoutiqueInfo {
  id: string;
  name: string;
  door: string;
  customerCode: string;
  city: string;
  country: string;
  address: string;
  buyerName: string;
  buyerEmail: string;
  repName: string;
  repEmail: string;
  currency: string;
}

export interface VerificationAuditReport {
  timestamp: string;
  totalProductsAudited: number;
  totalUnitsOrdered: number;
  totalUnitsSold: number;
  totalStockRemaining: number;
  totalWholesaleEur: number;
  totalRetailEur: number;
  totalRealizedRevenueEur: number;
  overallSellOutPct: number;
  zeroStockStylesCount: number;
  criticalLowStockCount: number;
  slowMoversCount: number;
  errorsDetected: number;
  warningsDetected: number;
  status: 'PERFECT_MATCH' | 'DISCREPANCIES_FOUND';
  discrepancies: Array<{
    style: string;
    issue: string;
    expected: string | number;
    found: string | number;
  }>;
  targetSellInUnits?: number;
  isSellInTargetMatched?: boolean;
  retailerBreakdown?: Array<{
    retailer: string;
    unitsOrdered: number;
    unitsSold: number;
    stockRemaining: number;
    stylesCount: number;
  }>;
}

export type ViewMode =
  | 'lookbook'
  | 'table'
  | 'silhouettes'
  | 'sizes'
  | 'po-compare';

export type SellOutStatus = 'ALL' | 'BESTSELLER' | 'HEALTHY' | 'SLOW' | 'OUT_OF_STOCK';

export interface FilterState {
  search: string;
  linesheet: string;
  silhouette: string;
  sellOutStatus: SellOutStatus;
  poNumber: string;
  sortBy: 'sellOutDesc' | 'unitsDesc' | 'wholesaleDesc' | 'retailDesc' | 'nameAsc';
}

export interface SalesObjectionItem {
  objection: string;
  customerRationale: string;
  salesResponse: string;
  luxuryCraftArgument: string;
  pairingSuggestion: string;
}
