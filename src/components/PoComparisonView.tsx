/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MergedProduct } from '../types';
import { PO_SCHEDULE_TIMELINE } from '../data/initialData';
import { GitCompare, Calendar, ArrowRight, Layers, ShoppingBag, Coins, TrendingUp } from 'lucide-react';

interface PoComparisonViewProps {
  products: MergedProduct[];
  onSelectPo: (poNumber: string) => void;
}

export const PoComparisonView: React.FC<PoComparisonViewProps> = ({
  products,
  onSelectPo,
}) => {
  const poStats = React.useMemo(() => {
    const map: Record<
      string,
      {
        poNumber: string;
        productsCount: number;
        unitsOrdered: number;
        unitsSold: number;
        wholesaleEur: number;
        retailEur: number;
        realizedRevenueEur: number;
        silhouettes: Record<string, number>;
        styles: string[];
      }
    > = {};

    products.forEach((p) => {
      p.poNumbers.forEach((po) => {
        if (!map[po]) {
          map[po] = {
            poNumber: po,
            productsCount: 0,
            unitsOrdered: 0,
            unitsSold: 0,
            wholesaleEur: 0,
            retailEur: 0,
            realizedRevenueEur: 0,
            silhouettes: {},
            styles: [],
          };
        }
        map[po].productsCount += 1;
        map[po].unitsOrdered += p.unitsOrdered;
        map[po].unitsSold += p.unitsSold;
        map[po].wholesaleEur += p.totalWholesaleEur;
        map[po].retailEur += p.totalRetailEur;
        map[po].realizedRevenueEur += p.realizedRevenueEur;
        map[po].silhouettes[p.silhouette] =
          (map[po].silhouettes[p.silhouette] || 0) + p.unitsOrdered;
        if (!map[po].styles.includes(p.styleClean)) {
          map[po].styles.push(p.styleClean);
        }
      });
    });

    return Object.values(map).map((item) => {
      const sellOutPct =
        item.unitsOrdered > 0 ? (item.unitsSold / item.unitsOrdered) * 100 : 0;
      const meta = PO_SCHEDULE_TIMELINE[item.poNumber] || {
        title: `PO #${item.poNumber}`,
        window: 'Consegna: Autunno/Inverno 2026',
        focus: 'Ordine B2B convalidato JOOR',
        linesheet: 'FW26 Assortimento',
      };

      return {
        ...item,
        sellOutPct,
        meta,
      };
    });
  }, [products]);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#12141c] border border-[#232733] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif text-[#f3f4f6] flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#cbb58b]" />
            <span>Confronto Purchase Orders (PO JOOR) & Drop di Consegna</span>
          </h2>
          <p className="text-xs text-[#9ca3af] mt-1">
            Analisi comparativa per tranche di spedizione, budget d’acquisto wholesale e sell-out registrato in boutique.
          </p>
        </div>

        <div className="text-xs text-[#9ca3af] font-mono">
          {poStats.length} Purchase Orders Registrati
        </div>
      </div>

      {/* Grid of PO Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {poStats.map((po) => {
          return (
            <div
              key={po.poNumber}
              className="bg-[#13161f] border border-[#232733] hover:border-[#cbb58b]/60 rounded p-4 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#cbb58b] px-1.5 py-0.5 rounded bg-[#cbb58b]/10 border border-[#cbb58b]/20">
                      PO #{po.poNumber}
                    </span>
                    <h3 className="font-serif text-base text-[#f3f4f6] font-medium mt-1">
                      {po.meta.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#9ca3af]">
                    {po.productsCount} stili
                  </span>
                </div>

                {/* Delivery Window */}
                <div className="flex items-center gap-1.5 text-xs text-[#38bdf8] bg-[#0c1a2e]/60 p-2 rounded border border-[#0284c7]/20 my-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{po.meta.window}</span>
                </div>

                {/* Focus */}
                <p className="text-[11px] text-[#9ca3af] italic mb-4">
                  {po.meta.focus}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#1e2330]">
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Valore Wholesale</span>
                    <span className="font-mono text-[#e5e7eb] font-medium">
                      {formatEuro(po.wholesaleEur)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Incasso Sell-Out</span>
                    <span className="font-mono text-[#34d399] font-semibold">
                      {formatEuro(po.realizedRevenueEur)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Unità Vendute</span>
                    <span className="font-mono text-[#f3f4f6]">
                      {po.unitsSold} <span className="text-[#6b7280]">/ {po.unitsOrdered} pz</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Tasso Sell-Out</span>
                    <span
                      className={`font-mono font-bold ${
                        po.sellOutPct >= 65
                          ? 'text-[#34d399]'
                          : po.sellOutPct >= 40
                          ? 'text-[#fbbf24]'
                          : 'text-[#f87171]'
                      }`}
                    >
                      {po.sellOutPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Category Mix preview */}
                <div className="mt-3 pt-3 border-t border-[#1e2330]">
                  <span className="text-[10px] text-[#6b7280] uppercase block mb-1.5">
                    Mix Categorie (Capi)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(po.silhouettes).map(([sil, cnt]) => (
                      <span
                        key={sil}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#161a24] text-[#d1d5db] border border-[#2c3242]"
                      >
                        {sil}: {cnt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => onSelectPo(po.poNumber)}
                className="mt-4 w-full py-1.5 px-3 rounded bg-[#171a23] hover:bg-[#202533] text-[#cbb58b] border border-[#2b3142] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Visualizza Capi di PO #{po.poNumber}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
