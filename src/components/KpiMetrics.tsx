/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Coins, 
  PackageCheck, 
  BarChart3, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { MergedProduct } from '../types';

interface KpiMetricsProps {
  products: MergedProduct[];
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ products }) => {
  const totals = React.useMemo(() => {
    let unitsOrdered = 0;
    let unitsSold = 0;
    let wholesaleEur = 0;
    let retailEur = 0;
    let realizedRevenue = 0;

    products.forEach((p) => {
      unitsOrdered += p.unitsOrdered;
      unitsSold += p.unitsSold;
      wholesaleEur += p.totalWholesaleEur;
      retailEur += p.totalRetailEur;
      realizedRevenue += p.realizedRevenueEur;
    });

    const stockRemaining = Math.max(0, unitsOrdered - unitsSold);
    const sellOutPct = unitsOrdered > 0 ? (unitsSold / unitsOrdered) * 100 : 0;
    const avgMarkup = wholesaleEur > 0 ? retailEur / wholesaleEur : 0;
    const grossMarginEur = realizedRevenue - (unitsSold > 0 ? (wholesaleEur / unitsOrdered) * unitsSold : 0);

    return {
      unitsOrdered,
      unitsSold,
      stockRemaining,
      wholesaleEur,
      retailEur,
      realizedRevenue,
      sellOutPct,
      avgMarkup,
      grossMarginEur,
    };
  }, [products]);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Sell-In Investimento Wholesale */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#383f52] transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span className="font-medium text-[#cbb58b]">Valore Sell-In</span>
          <Coins className="w-3.5 h-3.5 text-[#cbb58b]" />
        </div>
        <div className="text-lg md:text-xl font-semibold text-[#f3f4f6] font-mono">
          {formatEuro(totals.wholesaleEur)}
        </div>
        <div className="text-[11px] text-[#6b7280] mt-1 flex items-center justify-between">
          <span>Ordini B2B Wholesale</span>
          <span className="text-[#9ca3af]">Netto</span>
        </div>
      </div>

      {/* 2. Retail MSRP Teorico */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#383f52] transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span>Sell-In MSRP</span>
          <ShoppingBag className="w-3.5 h-3.5 text-[#9ca3af]" />
        </div>
        <div className="text-lg md:text-xl font-semibold text-[#f3f4f6] font-mono">
          {formatEuro(totals.retailEur)}
        </div>
        <div className="text-[11px] text-[#6b7280] mt-1 flex items-center justify-between">
          <span>Consigliato Retail</span>
          <span className="text-[#cbb58b] font-medium">{totals.avgMarkup.toFixed(2)}x Markup</span>
        </div>
      </div>

      {/* 3. Incasso Effettivo Realizzato */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#059669]/50 transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span className="font-medium text-[#34d399]">Incasso Sell-Out</span>
          <TrendingUp className="w-3.5 h-3.5 text-[#34d399]" />
        </div>
        <div className="text-lg md:text-xl font-semibold text-[#34d399] font-mono">
          {formatEuro(totals.realizedRevenue)}
        </div>
        <div className="text-[11px] text-[#6b7280] mt-1 flex items-center justify-between">
          <span>{totals.unitsSold > 0 ? 'Vendite Cassa' : 'Vendite al Dettaglio'}</span>
          <span className={totals.unitsSold > 0 ? 'text-[#34d399] flex items-center' : 'text-[#f59e0b]'}>
            {totals.unitsSold > 0 ? `+${formatEuro(totals.grossMarginEur)} marg.` : 'In attesa sell-out'}
          </span>
        </div>
      </div>

      {/* 4. Sell-Out Rate */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#383f52] transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span>Rotazione Sell-Out</span>
          <BarChart3 className="w-3.5 h-3.5 text-[#cbb58b]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg md:text-xl font-semibold text-[#f3f4f6] font-mono">
            {totals.sellOutPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#9ca3af]">
            {totals.unitsSold > 0 ? 'rotazione' : '0 vendite'}
          </span>
        </div>
        {/* Visual Progress Bar */}
        <div className="w-full bg-[#1e2330] h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              totals.sellOutPct >= 65
                ? 'bg-gradient-to-r from-[#10b981] to-[#34d399]'
                : totals.sellOutPct >= 45
                ? 'bg-gradient-to-r from-[#eab308] to-[#cbb58b]'
                : totals.sellOutPct > 0
                ? 'bg-gradient-to-r from-[#f97316] to-[#f43f5e]'
                : 'bg-[#2a3040]'
            }`}
            style={{ width: `${Math.max(2, Math.min(100, totals.sellOutPct))}%` }}
          />
        </div>
      </div>

      {/* 5. Capi Ordinati vs Venduti */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#383f52] transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span>Sell-Out / Sell-In</span>
          <PackageCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
        </div>
        <div className="text-lg md:text-xl font-semibold text-[#f3f4f6] font-mono flex items-baseline gap-1">
          <span>{totals.unitsSold}</span>
          <span className="text-xs text-[#6b7280]">/ {totals.unitsOrdered} pz</span>
        </div>
        <div className="text-[11px] text-[#6b7280] mt-1 flex items-center justify-between">
          <span>Unità Vendute / Ordinate</span>
          <span className={totals.unitsSold > 0 ? 'text-[#38bdf8] font-medium' : 'text-[#9ca3af]'}>
            {totals.unitsSold > 0 ? `${totals.unitsSold} venduti` : 'Giacenza 100%'}
          </span>
        </div>
      </div>

      {/* 6. Giacenza Residua In Boutique */}
      <div className="bg-[#13161f] border border-[#232733] rounded p-3.5 relative overflow-hidden group hover:border-[#383f52] transition-colors">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
          <span>Giacenza Negozio</span>
          <Sparkles className="w-3.5 h-3.5 text-[#cbb58b]" />
        </div>
        <div className="text-lg md:text-xl font-semibold text-[#cbb58b] font-mono">
          {totals.stockRemaining} <span className="text-xs font-normal text-[#9ca3af]">capi</span>
        </div>
        <div className="text-[11px] text-[#6b7280] mt-1 flex items-center justify-between">
          <span>Stock Disponibile</span>
          <span className="text-[#9ca3af]">Boutique</span>
        </div>
      </div>
    </div>
  );
};
