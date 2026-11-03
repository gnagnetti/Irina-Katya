/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MergedProduct } from '../types';
import { Grid3X3, AlertTriangle, CheckCircle2, Search, ArrowRight } from 'lucide-react';

interface SizeMatrixViewProps {
  products: MergedProduct[];
  onOpenDetail: (product: MergedProduct) => void;
}

export const SizeMatrixView: React.FC<SizeMatrixViewProps> = ({
  products,
  onOpenDetail,
}) => {
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('ALL');

  const sizeSummary = React.useMemo(() => {
    const sizeMap: Record<
      string,
      {
        size: string;
        ordered: number;
        sold: number;
        remaining: number;
        stylesWithStock: Array<{ product: MergedProduct; stockInSize: number }>;
      }
    > = {};

    products.forEach((p) => {
      Object.entries(p.sizesOrdered).forEach(([sz, ord]) => {
        if (!sizeMap[sz]) {
          sizeMap[sz] = {
            size: sz,
            ordered: 0,
            sold: 0,
            remaining: 0,
            stylesWithStock: [],
          };
        }
        const soldInSz = p.sizesSold[sz] || 0;
        const rem = ord - soldInSz;

        sizeMap[sz].ordered += ord;
        sizeMap[sz].sold += soldInSz;
        sizeMap[sz].remaining += rem;

        if (rem > 0) {
          sizeMap[sz].stylesWithStock.push({
            product: p,
            stockInSize: rem,
          });
        }
      });
    });

    // Custom sort: standard Italian sizes first, then alpha sizes, then U
    const standardOrder = [
      '36', '38', '40', '42', '44', '46', '48', '50', '52', '54',
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'U',
    ];

    const sortedList = Object.values(sizeMap).sort((a, b) => {
      const idxA = standardOrder.indexOf(a.size);
      const idxB = standardOrder.indexOf(b.size);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.size.localeCompare(b.size);
    });

    return sortedList;
  }, [products]);

  const activeSizeData =
    selectedSizeFilter === 'ALL'
      ? null
      : sizeSummary.find((s) => s.size === selectedSizeFilter);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#12141c] border border-[#232733] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif text-[#f3f4f6] flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-[#cbb58b]" />
            <span>Matrice Taglie & Disponibilità Negozio</span>
          </h2>
          <p className="text-xs text-[#9ca3af] mt-1">
            Visualizzazione incrociata della curva taglie ordinata e venduta per la boutique di Rostov sul Don.
          </p>
        </div>

        <div className="text-xs text-[#9ca3af]">
          Clicca su una taglia per vedere tutti i capi disponibili immediatamente in boutique.
        </div>
      </div>

      {/* Grid of Size Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {sizeSummary.map((item) => {
          const sellOutRate =
            item.ordered > 0 ? (item.sold / item.ordered) * 100 : 0;
          const isSelected = selectedSizeFilter === item.size;
          const isDepleted = item.remaining === 0;
          const isCritical = item.remaining <= 2 && item.remaining > 0;

          return (
            <div
              key={item.size}
              onClick={() =>
                setSelectedSizeFilter(isSelected ? 'ALL' : item.size)
              }
              className={`p-3 rounded border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1e2434] border-[#cbb58b] shadow-lg ring-1 ring-[#cbb58b]'
                  : 'bg-[#13161f] border-[#232733] hover:border-[#383f52]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-lg font-bold text-[#f3f4f6]">
                  {item.size}
                </span>
                {isDepleted ? (
                  <span className="w-2 h-2 rounded-full bg-red-500" title="Esaurita" />
                ) : isCritical ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Giacenza Critica" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Disponibile" />
                )}
              </div>

              <div className="text-xs font-mono">
                <div className="text-[#34d399] font-semibold">
                  {item.sold}{' '}
                  <span className="text-[#6b7280] font-normal">/ {item.ordered} v.</span>
                </div>
                <div className="text-[#9ca3af] text-[11px] mt-0.5">
                  Giac: <strong className="text-[#f3f4f6]">{item.remaining}</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1e2330] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#cbb58b] rounded-full"
                  style={{ width: `${Math.min(100, sellOutRate)}%` }}
                />
              </div>

              <div className="text-[10px] text-right font-mono text-[#cbb58b] mt-1">
                {sellOutRate.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer: Detailed list of styles available in selected size */}
      {activeSizeData && (
        <div className="bg-[#12141c] border border-[#2b3142] rounded p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#232733]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-[#f3f4f6]">
                Capi Disponibili in Taglia{' '}
                <strong className="text-[#cbb58b]">{activeSizeData.size}</strong>
              </span>
              <span className="text-xs text-[#9ca3af]">
                ({activeSizeData.stylesWithStock.length} modelli con giacenza immediata)
              </span>
            </div>

            <button
              onClick={() => setSelectedSizeFilter('ALL')}
              className="text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
            >
              Chiudi filtro taglia
            </button>
          </div>

          {activeSizeData.stylesWithStock.length === 0 ? (
            <div className="p-6 text-center text-[#9ca3af] text-xs">
              Nessun capo attualmente disponibile in taglia {activeSizeData.size}. Tutte le unità ordinate sono state vendute.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeSizeData.stylesWithStock.map(({ product, stockInSize }) => (
                <div
                  key={product.id}
                  onClick={() => onOpenDetail(product)}
                  className="p-2.5 rounded bg-[#171a23] border border-[#282e3e] hover:border-[#cbb58b] cursor-pointer transition-colors flex items-center gap-3"
                >
                  <div className="w-12 h-14 bg-[#1e222d] rounded overflow-hidden shrink-0 border border-white/5">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.styleName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-serif font-medium text-[#f3f4f6] truncate">
                      {product.styleName}
                    </h4>
                    <p className="text-[10px] text-[#9ca3af] font-mono">
                      {product.silhouette} · {product.colorCode}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-[#cbb58b] font-mono">
                        €{product.suggRetailEur}
                      </span>
                      <span className="font-mono text-[#34d399] font-semibold">
                        {stockInSize} pz disp.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
