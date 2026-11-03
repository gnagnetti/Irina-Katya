/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MergedProduct } from '../types';
import { Eye, ShoppingBag, AlertTriangle, BookOpen } from 'lucide-react';

interface ProductCardProps {
  product: MergedProduct;
  onOpenDetail: (product: MergedProduct) => void;
  onOpenTraining?: (product: MergedProduct) => void;
  language?: 'RU' | 'IT';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onOpenTraining,
  language = 'RU',
}) => {
  const [imgError, setImgError] = useState(false);

  const isSoldOut = product.stockRemaining === 0 && product.unitsOrdered > 0;
  const isSingleLeft = product.stockRemaining === 1;
  const hasSales = product.unitsSold > 0;

  // Extract clean PO number
  const primaryPo = (product.poNumbers && product.poNumbers[0]) || '18858382';

  // Format euro price cleanly
  const formatEur = (val: number) => {
    return Number.isInteger(val) ? `€${val}` : `€${val.toFixed(1)}`;
  };

  // Silhouette / Category display
  const categoryLabel = product.silhouette || product.category || 'Apparel';

  // Subtitle display: e.g. Marrone(0927) · #543779
  const colorDisplay = product.colorCode || product.color;
  const subtitle = `${colorDisplay} · #${product.styleNumber}`;

  // Progress percentage
  const progressPct = product.unitsOrdered > 0
    ? Math.min(100, Math.max(0, (product.unitsSold / product.unitsOrdered) * 100))
    : 0;

  const t = {
    sold: language === 'RU' ? 'Продано:' : 'Venduto:',
    ordered: language === 'RU' ? 'Заказано:' : 'Ordinato:',
    stock: language === 'RU' ? 'Остаток:' : 'Giacenza:',
    stockLabel: language === 'RU' ? 'Остаток' : 'Giacenza',
    pricing: language === 'RU' ? 'Розница / опт' : 'Retail / Wholesale',
    openCard: language === 'RU' ? 'Открыть карточку' : 'Dossier Capo',
    soldOutBadge: language === 'RU' ? 'РАСПРОДАНО' : 'ESAURITO',
    unitsShort: language === 'RU' ? 'шт.' : 'pz',
    inStock: language === 'RU' ? 'В наличии:' : 'In Magazzino:',
    oneLeft: language === 'RU' ? '1 Left' : '1 Rimanente',
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden flex items-center justify-center">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Category Pill */}
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100/95 text-stone-700 border border-stone-200/60 shadow-xs capitalize backdrop-blur-xs">
            {categoryLabel}
          </span>

          {/* Status Pill */}
          {isSoldOut ? (
            <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-sm bg-[#82182b] text-white shadow-xs">
              {t.soldOutBadge}
            </span>
          ) : hasSales ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-sm bg-[#0b533a] text-white shadow-xs">
              {t.sold} {product.unitsSold} {t.unitsShort}
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-sm bg-stone-100 text-stone-600 border border-stone-200/60 shadow-xs">
              {t.inStock} {product.stockRemaining} {t.unitsShort}
            </span>
          )}
        </div>

        {/* Product Image */}
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.styleName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 p-4 text-center">
            <ShoppingBag className="w-12 h-12 mb-2 text-stone-300" />
            <span className="font-serif text-sm text-stone-600">{product.styleClean}</span>
            <span className="text-[10px] text-stone-400 mt-1">{product.styleNumber}</span>
          </div>
        )}

        {/* Centered Hover Overlay Button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            onClick={() => onOpenDetail(product)}
            className="bg-white/95 hover:bg-white text-stone-900 border border-stone-200 shadow-md hover:shadow-lg px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-transform transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>{t.openCard}</span>
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        {/* Style Name & Code */}
        <div>
          <h3
            onClick={() => onOpenDetail(product)}
            className="text-lg font-serif font-normal text-stone-900 hover:text-[#925026] transition-colors cursor-pointer line-clamp-1"
            title={product.styleName}
          >
            {product.styleName}
          </h3>
          <p className="text-xs text-stone-500 font-normal mt-0.5 line-clamp-1" title={subtitle}>
            {subtitle}
          </p>
        </div>

        {/* Units Sold / Ordered Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span className="text-stone-700">
              {t.sold} <strong className="text-stone-900 font-semibold">{product.unitsSold} {t.unitsShort}</strong>
            </span>
            <span className="text-stone-600">
              {t.ordered} {product.unitsOrdered} {t.unitsShort}
            </span>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10b981] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stock remaining subtitle */}
          <div className="text-[11px] text-stone-500 mt-1">
            {t.stock} {product.stockRemaining} {t.unitsShort}
          </div>
        </div>

        {/* Pricing Row: Retail / Wholesale & Stock */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">
              {t.pricing}
            </span>
            <div className="text-sm font-semibold text-stone-900">
              {formatEur(product.suggRetailEur)} <span className="text-stone-400 font-normal">/</span> {formatEur(product.wholesaleEur)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">
              {t.stockLabel}
            </span>
            <div
              className={`text-sm font-semibold ${
                isSoldOut ? 'text-[#dc2626] font-bold' : 'text-stone-900'
              }`}
            >
              {product.stockRemaining} {t.unitsShort}
            </div>
          </div>
        </div>

        {/* Sizes Ordered Matrix Chips */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
          {Object.entries(product.sizesOrdered).map(([sz, qty]) => {
            const soldInSz = product.sizesSold[sz] || 0;
            const isSzSoldOut = soldInSz >= qty && qty > 0;

            return (
              <span
                key={sz}
                className={`text-[11px] px-2 py-0.5 rounded font-mono transition-colors ${
                  isSzSoldOut
                    ? 'bg-[#ffe8ec] text-[#e11d48] line-through font-medium'
                    : 'bg-stone-100 text-stone-700 font-normal'
                }`}
                title={`Taglia ${sz}: ${soldInSz}/${qty} ${t.unitsShort} (${qty - soldInSz} disponibili)`}
              >
                {sz}:{soldInSz}/{qty}
              </span>
            );
          })}
        </div>

        {/* Card Footer: PO# & Warning Badge */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>PO# {primaryPo}</span>

          {isSoldOut ? (
            <span className="text-[#dc2626] font-semibold tracking-wider text-[11px] font-sans">
              {t.soldOutBadge}
            </span>
          ) : isSingleLeft ? (
            <span className="text-amber-700 font-medium flex items-center gap-1 text-[11px] font-sans">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{t.oneLeft}</span>
            </span>
          ) : onOpenTraining ? (
            <button
              onClick={() => onOpenTraining(product)}
              className="text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-1 text-[11px] font-sans font-normal"
              title="Apri scheda consigli vendita e styling"
            >
              <BookOpen className="w-3 h-3 text-stone-400" />
              <span>Styling</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
