/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MergedProduct } from '../types';
import { getSwatchHex } from '../utils/etl';
import { 
  X, 
  BookOpen, 
  ShoppingBag, 
  Sparkles, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Coins, 
  Printer,
  Tag
} from 'lucide-react';

interface ProductDetailModalProps {
  product: MergedProduct | null;
  onClose: () => void;
  onOpenTraining: (product: MergedProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenTraining,
}) => {
  if (!product) return null;

  const swatchHex = getSwatchHex(product.colorPrefix);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#12141c] border border-[#2b3142] rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#161a24]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#cbb58b] font-medium px-2 py-0.5 rounded border border-[#cbb58b]/30 bg-[#cbb58b]/10">
              Dossier Tecnico Capo
            </span>
            <span className="text-xs font-mono text-[#9ca3af]">
              Cod. {product.styleNumber} · PO #{product.poNumbers.join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202533] transition-colors"
              title="Stampa scheda tecnica"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Garment Image */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="aspect-[3/4] bg-[#1a1d26] rounded overflow-hidden border border-[#2b3142] relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.styleName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#6b7280]">
                  <ShoppingBag className="w-12 h-12 opacity-30 text-[#cbb58b]" />
                  <span className="font-serif text-sm mt-2">{product.styleClean}</span>
                </div>
              )}

              {/* Status pill */}
              <div className="absolute top-3 left-3 bg-[#0c0d10]/90 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded text-xs font-mono">
                {product.silhouette}
              </div>
            </div>

            {/* Color preview card */}
            <div className="p-3 bg-[#171a23] rounded border border-[#282e3e] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full border border-white/30 shadow-inner"
                  style={{ backgroundColor: swatchHex }}
                />
                <div>
                  <div className="text-xs font-medium text-[#f3f4f6]">
                    {product.colorCode}
                  </div>
                  <div className="text-[10px] font-mono text-[#9ca3af]">
                    Codice fabbrica: {product.color}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#cbb58b]">
                #{product.colorPrefix}
              </span>
            </div>
          </div>

          {/* Right Column: Garment Specifications & Metrics */}
          <div className="md:col-span-7 flex flex-col justify-between gap-6">
            <div>
              {/* Title & Line */}
              <div>
                <h2 className="text-2xl md:text-3xl font-serif text-[#f3f4f6] font-normal">
                  {product.styleName}
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1 flex items-center gap-2">
                  <span className="text-[#cbb58b] font-medium">{product.linesheet}</span>
                  <span>·</span>
                  <span>{product.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#9ca3af]" />
                    Made in {product.countryOfOrigin}
                  </span>
                </p>
              </div>

              {/* Fabric Specification */}
              <div className="mt-4 p-3.5 bg-[#171a23] rounded border border-[#282e3e]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#9ca3af] mb-1">
                  Composizione Sartoriale & Tessuto
                </div>
                <div className="text-sm text-[#f3f4f6] font-medium">
                  {product.fabrication}
                </div>
                {product.styleTags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.styleTags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#202533] text-[#d1d5db] border border-[#2c3242]"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Commercial Economics Matrix */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#151822] rounded border border-[#232733]">
                  <span className="text-[10px] text-[#6b7280] uppercase block">Wholesale B2B</span>
                  <span className="text-sm font-mono font-semibold text-[#f3f4f6]">
                    {formatEuro(product.wholesaleEur)}
                  </span>
                </div>
                <div className="p-3 bg-[#151822] rounded border border-[#232733]">
                  <span className="text-[10px] text-[#6b7280] uppercase block">Retail MSRP</span>
                  <span className="text-sm font-mono font-semibold text-[#cbb58b]">
                    {formatEuro(product.suggRetailEur)}
                  </span>
                </div>
                <div className="p-3 bg-[#151822] rounded border border-[#232733]">
                  <span className="text-[10px] text-[#6b7280] uppercase block">Markup Ratio</span>
                  <span className="text-sm font-mono font-semibold text-[#34d399]">
                    {product.markup}x
                  </span>
                </div>
              </div>

              {/* Sell-Out & Inventory Performance */}
              <div className="mt-4 p-3.5 bg-[#151822] rounded border border-[#232733]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#9ca3af] uppercase text-[10px] font-mono">
                    Rotazione di Cassa Boutique
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      product.sellOutPct >= 70
                        ? 'text-[#34d399]'
                        : product.sellOutPct >= 40
                        ? 'text-[#fbbf24]'
                        : 'text-[#f87171]'
                    }`}
                  >
                    {product.sellOutPct.toFixed(1)}% Sell-Out
                  </span>
                </div>

                <div className="w-full bg-[#1e2330] h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      product.sellOutPct >= 70
                        ? 'bg-[#10b981]'
                        : product.sellOutPct >= 40
                        ? 'bg-[#eab308]'
                        : 'bg-[#f43f5e]'
                    }`}
                    style={{ width: `${Math.min(100, product.sellOutPct)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#6b7280] block">Ordinati</span>
                    <span className="font-mono font-medium text-[#f3f4f6]">
                      {product.unitsOrdered} pz
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] block">Venduti</span>
                    <span className="font-mono font-medium text-[#34d399]">
                      {product.unitsSold} pz
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] block">Giacenza Residua</span>
                    <span className="font-mono font-medium text-[#cbb58b]">
                      {product.stockRemaining} pz
                    </span>
                  </div>
                </div>
              </div>

              {/* Size Distribution Grid */}
              <div className="mt-4">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#9ca3af] block mb-2">
                  Dettaglio Matrice Taglie
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.entries(product.sizesOrdered).map(([sz, ord]) => {
                    const sold = product.sizesSold[sz] || 0;
                    const rem = ord - sold;
                    return (
                      <div
                        key={sz}
                        className={`p-2 rounded text-center border font-mono ${
                          rem === 0
                            ? 'bg-[#181a22] text-[#6b7280] border-[#252a38]'
                            : 'bg-[#161a24] text-[#f3f4f6] border-[#2c3242]'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#cbb58b]">{sz}</div>
                        <div className="text-[10px] text-[#34d399] mt-0.5">
                          {sold}/{ord} vend.
                        </div>
                        <div className="text-[9px] text-[#9ca3af] mt-0.5">
                          {rem === 0 ? 'Esaurito' : `${rem} disp.`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#232733] flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenTraining(product);
                }}
                className="flex-1 py-2.5 px-4 rounded bg-[#cbb58b] hover:bg-[#dfcda6] text-[#0c0d10] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Apri Argomentario Sartoriale & Superamento Obiezioni</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
