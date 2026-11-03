/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MergedProduct, SalesObjectionItem } from '../types';
import { SALES_OBJECTIONS_KNOWLEDGE_BASE } from '../data/initialData';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  ShoppingBag, 
  Printer, 
  Check, 
  HelpCircle,
  Scissors,
  Layers,
  Heart
} from 'lucide-react';

interface ModelTrainingSheetProps {
  product: MergedProduct | null;
  onClose: () => void;
  allProducts: MergedProduct[];
  onSelectProduct: (product: MergedProduct) => void;
}

export const ModelTrainingSheet: React.FC<ModelTrainingSheetProps> = ({
  product,
  onClose,
  allProducts,
  onSelectProduct,
}) => {
  if (!product) return null;

  // Find relevant objections based on category
  const generalObjections = SALES_OBJECTIONS_KNOWLEDGE_BASE.general || [];
  let categoryObjections: SalesObjectionItem[] = [];

  if (['Pullover', 'Cardigan', 'Knitwear'].includes(product.silhouette)) {
    categoryObjections = SALES_OBJECTIONS_KNOWLEDGE_BASE.Knitwear || [];
  } else if (['Jacket', 'Coat', 'Suit', 'Pants', 'Skirt'].includes(product.silhouette)) {
    categoryObjections = SALES_OBJECTIONS_KNOWLEDGE_BASE.Tailoring || [];
  } else if (['Bag', 'Belt', 'Earring', 'Key Ring', 'Accessory'].includes(product.silhouette)) {
    categoryObjections = SALES_OBJECTIONS_KNOWLEDGE_BASE.Accessories || [];
  }

  const combinedObjections = [...categoryObjections, ...generalObjections];

  // Coordinated total look pairings
  const complementaryItems = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.silhouette === 'Bag' ||
          p.silhouette === 'Belt' ||
          p.silhouette === 'Earring' ||
          (product.silhouette === 'Skirt' && p.silhouette === 'Pullover') ||
          (product.silhouette === 'Pullover' && p.silhouette === 'Skirt'))
    )
    .slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#10121a] border border-[#3b3424] rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Top Gold Foil Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#8a7243] via-[#cbb58b] to-[#6d5b32]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#cbb58b]/20 border border-[#cbb58b]/40 flex items-center justify-center text-[#cbb58b] font-serif font-bold text-sm">
              LS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif uppercase tracking-widest text-[#cbb58b] font-semibold">
                  Scheda Formazione & Argomentario Boutique
                </h3>
                <span className="text-[10px] text-[#9ca3af] px-1.5 py-0.5 rounded bg-[#1e2330]">
                  Clientele Excellence
                </span>
              </div>
              <p className="text-xs text-[#d1d5db]">
                Modello: <strong className="text-white font-serif text-sm">{product.styleName}</strong> (Cod. {product.styleNumber}) · Retail €{product.suggRetailEur}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202533] transition-colors"
              title="Stampa scheda per il personale di cassa"
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Garment Quick Brief & Craftsmanship */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded bg-[#151822] border border-[#262c3d]">
            <div className="md:col-span-3 aspect-[3/4] bg-[#1c202d] rounded overflow-hidden border border-white/5">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.styleName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                  <ShoppingBag className="w-8 h-8 opacity-40 text-[#cbb58b]" />
                </div>
              )}
            </div>

            <div className="md:col-span-9 flex flex-col justify-between text-xs space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#cbb58b]">
                  L’Eccellenza Sartoriale Made in {product.countryOfOrigin}
                </span>
                <h4 className="text-lg font-serif text-[#f3f4f6] mt-0.5">
                  {product.styleName} · Collezione {product.linesheet}
                </h4>
                <p className="text-[#d1d5db] mt-1.5 leading-relaxed">
                  Capo cardine della selezione FW26 per la boutique Smykov. Realizzato con{' '}
                  <strong className="text-[#cbb58b]">{product.fabrication}</strong>. La maison
                  Luisa Spagnoli dal 1928 unisce la tradizione manifatturiera umbra al rigore
                  contemporaneo: ogni asola, fodera e finitura è concepita per durare una vita senza
                  deformazioni strutturali.
                </p>
              </div>

              {/* 3 Value Pillars for Sales Assistant */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#232733]">
                <div className="p-2 rounded bg-[#181c28]">
                  <span className="text-[#cbb58b] font-semibold flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3 shrink-0" /> Filato Nobile
                  </span>
                  <p className="text-[10px] text-[#9ca3af] mt-1">
                    Fibre selezionate ad altissima coibenza termica, leggere e soffici al tatto.
                  </p>
                </div>
                <div className="p-2 rounded bg-[#181c28]">
                  <span className="text-[#38bdf8] font-semibold flex items-center gap-1 text-[11px]">
                    <Scissors className="w-3 h-3 shrink-0" /> Taglio Perfetto
                  </span>
                  <p className="text-[10px] text-[#9ca3af] mt-1">
                    Cuciture ribattute calibrate per assecondare la postura naturale.
                  </p>
                </div>
                <div className="p-2 rounded bg-[#181c28]">
                  <span className="text-[#34d399] font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> Longevità Capi
                  </span>
                  <p className="text-[10px] text-[#9ca3af] mt-1">
                    Resistenza all’usura e al pilling, investimento sartoriale per il guardaroba.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Section: Objection Overcoming Matrix */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#cbb58b]" />
              <h4 className="text-sm font-serif uppercase tracking-wider text-[#f3f4f6] font-semibold">
                Matrice Superamento Obiezioni Cliente in Boutique
              </h4>
            </div>

            <div className="space-y-3">
              {combinedObjections.map((obj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded bg-[#151822] border border-[#232733] hover:border-[#383f52] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-serif text-sm font-semibold text-[#f87171] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      Obiezione: &ldquo;{obj.objection}&rdquo;
                    </span>
                    <span className="text-[10px] text-[#9ca3af] px-1.5 py-0.5 rounded bg-[#1b1e2a]">
                      Modulo Vendita {idx + 1}
                    </span>
                  </div>

                  <p className="text-xs text-[#9ca3af] italic mb-3">
                    <strong>Contesto Psicologico Cliente:</strong> {obj.customerRationale}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-[#1e2330]">
                    {/* What to Say */}
                    <div className="bg-[#1b2230] p-3 rounded border border-[#2d3748]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#38bdf8] block font-semibold mb-1">
                        Risposta Consigliata all&apos;Assistente:
                      </span>
                      <p className="text-[#e5e7eb] leading-relaxed">
                        &ldquo;{obj.salesResponse}&rdquo;
                      </p>
                    </div>

                    {/* Luxury Craftsmanship Proof */}
                    <div className="bg-[#241f17] p-3 rounded border border-[#524424]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#cbb58b] block font-semibold mb-1">
                        Dettaglio Sartoriale di Supporto:
                      </span>
                      <p className="text-[#dfcda6] leading-relaxed">
                        {obj.luxuryCraftArgument}
                      </p>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#34d399]">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      <strong>Strategia di chiusura:</strong> {obj.pairingSuggestion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coordinated Total Look Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#cbb58b]" />
              <h4 className="text-sm font-serif uppercase tracking-wider text-[#f3f4f6] font-semibold">
                Proposta &ldquo;Total Look&rdquo; Coordinato FW26
              </h4>
            </div>

            <p className="text-xs text-[#9ca3af] mb-3">
              Suggerisci questi abbinamenti per incrementare lo scontrino medio boutique e offrire una consulenza d&apos;immagine completa:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {complementaryItems.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => onSelectProduct(comp)}
                  className="p-3 rounded bg-[#151822] border border-[#282e3e] hover:border-[#cbb58b] cursor-pointer transition-colors flex items-center gap-3 group"
                >
                  <div className="w-12 h-16 bg-[#1a1d26] rounded overflow-hidden shrink-0 border border-white/5">
                    {comp.image && (
                      <img
                        src={comp.image}
                        alt={comp.styleName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="text-[9px] uppercase font-mono text-[#cbb58b]">
                      {comp.silhouette}
                    </span>
                    <h5 className="font-serif font-medium text-[#f3f4f6] truncate group-hover:text-[#cbb58b]">
                      {comp.styleName}
                    </h5>
                    <p className="text-[10px] text-[#9ca3af] truncate mt-0.5">
                      {comp.colorCode}
                    </p>
                    <span className="text-[11px] font-mono text-[#34d399] font-medium block mt-1">
                      €{comp.suggRetailEur}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232733] bg-[#141722] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">
            Formazione Retail · IP Smykov Igor Viktorovich (Rostov on Don)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#202533] hover:bg-[#2b3245] text-[#f3f4f6] transition-colors"
          >
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
};
