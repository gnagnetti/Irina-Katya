/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MergedProduct } from '../types';
import { getSwatchHex } from '../utils/etl';
import { 
  ArrowUpDown, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TableViewProps {
  products: MergedProduct[];
  onOpenDetail: (product: MergedProduct) => void;
  onOpenTraining: (product: MergedProduct) => void;
  boutiqueName: string;
}

export const TableView: React.FC<TableViewProps> = ({
  products,
  onOpenDetail,
  onOpenTraining,
  boutiqueName,
}) => {
  const [sortField, setSortField] = useState<keyof MergedProduct>('sellOutPct');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: keyof MergedProduct) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        const cmp = (valA as string).localeCompare(valB as string);
        return sortAsc ? cmp : -cmp;
      }
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [products, sortField, sortAsc]);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToExcel = () => {
    const exportRows = sortedProducts.map((p) => {
      // Create sizes breakdown string
      const sizesStr = Object.entries(p.sizesOrdered)
        .map(([s, ord]) => `${s}: ${p.sizesSold[s] || 0}/${ord}`)
        .join(', ');

      return {
        'Codice Modello': p.styleNumber,
        'Nome Modello': p.styleName,
        'Linea Collezione': p.linesheet,
        'Silhouette / Categoria': p.silhouette,
        'Composizione / Tessuto': p.fabrication,
        'Colore': p.colorCode,
        'Codice Colore': p.colorPrefix,
        'Prezzo Wholesale B2B (€)': p.wholesaleEur,
        'Prezzo Retail MSRP (€)': p.suggRetailEur,
        'Markup Ratio': p.markup,
        'Unità Ordinate': p.unitsOrdered,
        'Unità Vendute': p.unitsSold,
        'Giacenza Residua': p.stockRemaining,
        'Tasso Sell-Out (%)': p.sellOutPct,
        'Valore Ordine Wholesale (€)': p.totalWholesaleEur,
        'Valore Teorico Retail (€)': p.totalRetailEur,
        'Incasso Effettivo Realizzato (€)': p.realizedRevenueEur,
        'Purchase Orders (PO#)': p.poNumbers.join(', '),
        'Matrice Taglie (Vendute/Ordinate)': sizesStr,
        'Paese di Origine': p.countryOfOrigin,
        'Boutique Concessionaria': p.retailer,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Luisa Spagnoli FW26 SellOut');

    // Auto-fit column width
    const maxWidths = Object.keys(exportRows[0] || {}).map((key) => ({
      wch: Math.max(key.length, 14),
    }));
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(
      workbook,
      `Luisa_Spagnoli_FW26_Wholesale_SellOut_${boutiqueName.replace(/\s+/g, '_')}.xlsx`
    );
  };

  return (
    <div className="bg-[#12141c] border border-[#232733] rounded overflow-hidden shadow-sm">
      {/* Table Action Bar */}
      <div className="p-3 bg-[#151822] border-b border-[#232733] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm text-[#f3f4f6]">
            Tabella Analitica Modelli & Sell-Out
          </span>
          <span className="text-[#9ca3af]">({sortedProducts.length} referenze)</span>
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2432] hover:bg-[#283042] text-[#cbb58b] border border-[#cbb58b]/30 hover:border-[#cbb58b] font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Esporta Foglio Excel XLSX</span>
        </button>
      </div>

      {/* Interactive Table Container */}
      <div className="overflow-x-auto max-h-[750px] scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#171a24] text-[#9ca3af] sticky top-0 z-20 border-b border-[#232733]">
            <tr>
              <th className="py-2.5 px-3 w-8"></th>
              <th className="py-2.5 px-2 w-12">Foto</th>
              <th
                onClick={() => handleSort('styleName')}
                className="py-2.5 px-3 cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center gap-1">
                  <span>Modello & Codice</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('silhouette')}
                className="py-2.5 px-3 cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center gap-1">
                  <span>Categoria</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-medium">Tessuto & Colore</th>
              <th
                onClick={() => handleSort('wholesaleEur')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sell-In (€)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('suggRetailEur')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>MSRP (€)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unitsOrdered')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Sell-In pz</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unitsSold')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Sell-Out pz</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('stockRemaining')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Giacenza</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sellOutPct')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sell-Out %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('realizedRevenueEur')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f3f4f6] font-medium"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Incasso Sell-Out</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2330]">
            {sortedProducts.map((p) => {
              const isExpanded = expandedRow === p.id;
              const swatch = getSwatchHex(p.colorPrefix);

              return (
                <React.Fragment key={p.id}>
                  <tr
                    className={`hover:bg-[#181c26] transition-colors ${
                      isExpanded ? 'bg-[#181c26]' : ''
                    }`}
                  >
                    {/* Expand icon */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                        className="text-[#9ca3af] hover:text-[#f3f4f6]"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Image thumb */}
                    <td className="py-2 px-2">
                      <div
                        onClick={() => onOpenDetail(p)}
                        className="w-9 h-11 bg-[#1a1d26] rounded overflow-hidden cursor-pointer border border-[#2b3142] flex items-center justify-center"
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.styleName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#6b7280]" />
                        )}
                      </div>
                    </td>

                    {/* Style & Code */}
                    <td className="py-2 px-3">
                      <div
                        onClick={() => onOpenDetail(p)}
                        className="font-medium text-[#f3f4f6] hover:text-[#cbb58b] cursor-pointer"
                      >
                        {p.styleName}
                      </div>
                      <div className="text-[10px] font-mono text-[#9ca3af]">
                        {p.styleNumber} · {p.linesheet}
                      </div>
                    </td>

                    {/* Silhouette */}
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[#161a24] text-[#d1d5db] border border-[#2c3242]">
                        {p.silhouette}
                      </span>
                    </td>

                    {/* Fabric & Color */}
                    <td className="py-2 px-3 max-w-[200px]">
                      <div className="text-[11px] text-[#e5e7eb] truncate" title={p.fabrication}>
                        {p.fabrication}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: swatch }}
                        />
                        <span className="text-[10px] text-[#9ca3af] truncate">{p.colorCode}</span>
                      </div>
                    </td>

                    {/* Wholesale */}
                    <td className="py-2 px-3 text-right font-mono text-[#e5e7eb]">
                      {formatEuro(p.wholesaleEur)}
                    </td>

                    {/* MSRP */}
                    <td className="py-2 px-3 text-right font-mono text-[#cbb58b] font-medium">
                      {formatEuro(p.suggRetailEur)}
                    </td>

                    {/* Ordered */}
                    <td className="py-2 px-3 text-center font-mono font-medium text-[#f3f4f6]">
                      {p.unitsOrdered}
                    </td>

                    {/* Sold */}
                    <td className="py-2 px-3 text-center font-mono font-medium">
                      {p.unitsSold > 0 ? (
                        <span className="text-[#34d399]">{p.unitsSold}</span>
                      ) : (
                        <span className="text-[#6b7280]">0</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-2 px-3 text-center font-mono text-[#f3f4f6]">
                      {p.stockRemaining === 0 ? (
                        <span className="text-[#f87171] font-semibold">0</span>
                      ) : p.stockRemaining === 1 ? (
                        <span className="text-[#fbbf24] font-semibold">1</span>
                      ) : (
                        p.stockRemaining
                      )}
                    </td>

                    {/* Sell-out % */}
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      <span
                        className={
                          p.sellOutPct >= 70
                            ? 'text-[#34d399]'
                            : p.sellOutPct >= 40
                            ? 'text-[#fbbf24]'
                            : p.sellOutPct > 0
                            ? 'text-[#f87171]'
                            : 'text-[#6b7280]'
                        }
                      >
                        {p.sellOutPct.toFixed(0)}%
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-2 px-3 text-right font-mono text-[#f3f4f6]">
                      {p.realizedRevenueEur > 0 ? (
                        formatEuro(p.realizedRevenueEur)
                      ) : (
                        <span className="text-[#6b7280]">€ 0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(p)}
                          className="p-1 rounded bg-[#1e2330] hover:bg-[#283042] text-[#9ca3af] hover:text-[#f3f4f6]"
                          title="Dossier Capo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenTraining(p)}
                          className="p-1 rounded bg-[#2a2417] hover:bg-[#3d331f] text-[#cbb58b] border border-[#cbb58b]/30"
                          title="Argomentario Vendita"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row: Size Matrix breakdown & PO details */}
                  {isExpanded && (
                    <tr className="bg-[#141720]/80">
                      <td colSpan={13} className="p-4 border-y border-[#282e3e]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Size distribution */}
                          <div className="md:col-span-2">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2">
                              Ripartizione Taglie Boutique (Venduti / Ordinati / Giacenza)
                            </h4>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                              {Object.entries(p.sizesOrdered).map(([sz, ord]) => {
                                const sold = p.sizesSold[sz] || 0;
                                const rem = ord - sold;
                                return (
                                  <div
                                    key={sz}
                                    className={`p-2 rounded border text-center font-mono ${
                                      rem === 0
                                        ? 'bg-[#1b1e28] border-red-500/30 text-[#9ca3af]'
                                        : 'bg-[#181c26] border-[#2c3242] text-[#f3f4f6]'
                                    }`}
                                  >
                                    <div className="text-xs font-bold text-[#cbb58b]">{sz}</div>
                                    <div className="text-[11px] mt-0.5">
                                      <span className="text-[#34d399] font-semibold">{sold}</span>
                                      <span className="text-[#6b7280]">/{ord}</span>
                                    </div>
                                    <div className="text-[10px] text-[#9ca3af] mt-0.5">
                                      {rem === 0 ? (
                                        <span className="text-red-400">Esaurito</span>
                                      ) : (
                                        <span>{rem} disp.</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Purchase Orders & Timing */}
                          <div className="bg-[#181c26] p-3 rounded border border-[#2c3242] flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2">
                                Dati D’Acquisto JOOR
                              </h4>
                              <p className="text-[11px] text-[#e5e7eb]">
                                <strong>PO#:</strong> {p.poNumbers.join(', ')}
                              </p>
                              <p className="text-[11px] text-[#e5e7eb] mt-1">
                                <strong>Finestra Consegna:</strong> {p.startShip || '01/03/2026'} –{' '}
                                {p.completeShip || '20/03/2026'}
                              </p>
                              <p className="text-[11px] text-[#e5e7eb] mt-1">
                                <strong>Origine Sartoriale:</strong> Made in {p.countryOfOrigin}
                              </p>
                            </div>
                            <button
                              onClick={() => onOpenTraining(p)}
                              className="mt-3 w-full py-1.5 px-3 rounded bg-[#cbb58b] text-[#0c0d10] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#dfcda6] transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Apri Argomentario & Obiezioni</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
