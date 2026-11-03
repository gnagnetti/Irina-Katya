/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MergedProduct } from '../types';
import { PieChart, TrendingUp, AlertCircle, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface SilhouetteBreakdownProps {
  products: MergedProduct[];
  onSelectSilhouette: (silhouette: string) => void;
}

export const SilhouetteBreakdown: React.FC<SilhouetteBreakdownProps> = ({
  products,
  onSelectSilhouette,
}) => {
  const stats = React.useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        count: number;
        unitsOrdered: number;
        unitsSold: number;
        wholesaleEur: number;
        retailEur: number;
        realizedRevenueEur: number;
        styles: string[];
      }
    > = {};

    let grandUnits = 0;
    let grandWholesale = 0;
    let grandRevenue = 0;

    products.forEach((p) => {
      const sil = p.silhouette || 'Altro';
      if (!map[sil]) {
        map[sil] = {
          name: sil,
          count: 0,
          unitsOrdered: 0,
          unitsSold: 0,
          wholesaleEur: 0,
          retailEur: 0,
          realizedRevenueEur: 0,
          styles: [],
        };
      }
      map[sil].count += 1;
      map[sil].unitsOrdered += p.unitsOrdered;
      map[sil].unitsSold += p.unitsSold;
      map[sil].wholesaleEur += p.totalWholesaleEur;
      map[sil].retailEur += p.totalRetailEur;
      map[sil].realizedRevenueEur += p.realizedRevenueEur;
      if (!map[sil].styles.includes(p.styleClean)) {
        map[sil].styles.push(p.styleClean);
      }

      grandUnits += p.unitsOrdered;
      grandWholesale += p.totalWholesaleEur;
      grandRevenue += p.realizedRevenueEur;
    });

    const list = Object.values(map).map((item) => {
      const sellOutPct =
        item.unitsOrdered > 0 ? (item.unitsSold / item.unitsOrdered) * 100 : 0;
      const wholesaleSharePct =
        grandWholesale > 0 ? (item.wholesaleEur / grandWholesale) * 100 : 0;
      const unitsSharePct =
        grandUnits > 0 ? (item.unitsOrdered / grandUnits) * 100 : 0;

      return {
        ...item,
        sellOutPct,
        wholesaleSharePct,
        unitsSharePct,
      };
    });

    // Sort by wholesale investment descending
    list.sort((a, b) => b.wholesaleEur - a.wholesaleEur);

    return {
      list,
      grandUnits,
      grandWholesale,
      grandRevenue,
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
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#12141c] border border-[#232733] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif text-[#f3f4f6] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#cbb58b]" />
            <span>Merchandising Mix & Ripartizione Categorie FW26</span>
          </h2>
          <p className="text-xs text-[#9ca3af] mt-1">
            Analisi di rotazione e incidenza di budget su {stats.list.length} categorie merceologiche
            ordinate dalla boutique.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-[#6b7280] block text-[10px] uppercase">Budget Wholesale</span>
            <span className="text-[#f3f4f6] font-semibold">{formatEuro(stats.grandWholesale)}</span>
          </div>
          <div>
            <span className="text-[#6b7280] block text-[10px] uppercase">Totale Pezzi</span>
            <span className="text-[#cbb58b] font-semibold">{stats.grandUnits} pz</span>
          </div>
          <div>
            <span className="text-[#6b7280] block text-[10px] uppercase">Incasso Realizzato</span>
            <span className="text-[#34d399] font-semibold">{formatEuro(stats.grandRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Grid of Silhouette Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.list.map((cat) => {
          const isHighVelocity = cat.sellOutPct >= 65;
          const isSlow = cat.sellOutPct < 40;

          return (
            <div
              key={cat.name}
              className="bg-[#13161f] border border-[#232733] hover:border-[#cbb58b]/50 rounded p-4 flex flex-col justify-between transition-colors shadow-sm"
            >
              {/* Category Title & Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-serif text-base text-[#f3f4f6] font-medium flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className="text-xs font-sans text-[#9ca3af] font-normal">
                        ({cat.count} stili)
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#6b7280] mt-0.5 truncate max-w-[240px]">
                      {cat.styles.slice(0, 3).join(', ')}
                      {cat.styles.length > 3 ? ` +${cat.styles.length - 3}` : ''}
                    </p>
                  </div>

                  {isHighVelocity ? (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-[#065f46]/80 text-[#6ee7b7] border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> Alta Rotazione
                    </span>
                  ) : isSlow ? (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-[#451a1a]/80 text-[#fca5a5] border border-red-500/30 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-2.5 h-2.5" /> Slow Mover
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-[#1e2330] text-[#9ca3af] border border-[#2c3242] shrink-0">
                      Regolare
                    </span>
                  )}
                </div>

                {/* Progress Bar of Sell-Out */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-[#9ca3af]">Sell-Out Categoria</span>
                    <span
                      className={`font-mono font-bold ${
                        isHighVelocity
                          ? 'text-[#34d399]'
                          : isSlow
                          ? 'text-[#f87171]'
                          : 'text-[#fbbf24]'
                      }`}
                    >
                      {cat.sellOutPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1e2330] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighVelocity
                          ? 'bg-gradient-to-r from-[#059669] to-[#34d399]'
                          : isSlow
                          ? 'bg-gradient-to-r from-[#dc2626] to-[#f87171]'
                          : 'bg-gradient-to-r from-[#d97706] to-[#fbbf24]'
                      }`}
                      style={{ width: `${Math.min(100, cat.sellOutPct)}%` }}
                    />
                  </div>
                </div>

                {/* Financial & Unit Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#1e2330] text-xs">
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Pezzi Venduti</span>
                    <span className="font-mono text-[#f3f4f6] font-semibold">
                      {cat.unitsSold}{' '}
                      <span className="text-[#6b7280] font-normal">/ {cat.unitsOrdered}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Incidenza Budget</span>
                    <span className="font-mono text-[#cbb58b] font-semibold">
                      {cat.wholesaleSharePct.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Valore Wholesale</span>
                    <span className="font-mono text-[#e5e7eb]">
                      {formatEuro(cat.wholesaleEur)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase block">Incasso Realizzato</span>
                    <span className="font-mono text-[#34d399] font-medium">
                      {formatEuro(cat.realizedRevenueEur)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button to Filter by this category */}
              <button
                onClick={() => onSelectSilhouette(cat.name)}
                className="mt-4 w-full py-1.5 px-3 rounded bg-[#171a23] hover:bg-[#202533] text-[#cbb58b] hover:text-[#dfcda6] border border-[#2b3142] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Filtra Capi {cat.name}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
