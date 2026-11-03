/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  Terminal, 
  Upload, 
  Layers, 
  LayoutGrid, 
  Table as TableIcon, 
  PieChart, 
  Grid3X3, 
  GitCompare,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  Globe
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  selectedRetailer: string;
  retailers: string[];
  onSelectRetailer: (retailer: string) => void;
  retailerCustomerCode?: string;
  retailerCity?: string;
  retailerCountry?: string;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  selectedLinesheet: string;
  linesheets: string[];
  onSelectLinesheet: (linesheet: string) => void;
  onOpenAudit: () => void;
  onOpenUpload: () => void;
  onOpenSellOutUpload: () => void;
  onOpenPythonScript: () => void;
  onOpenConverter: () => void;
  onExportExcel: () => void;
  totalProductsCount: number;
  sellOutUnitsCount: number;
  language?: 'RU' | 'IT';
  onToggleLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRetailer,
  retailers,
  onSelectRetailer,
  retailerCustomerCode,
  retailerCity,
  retailerCountry,
  viewMode,
  onSelectViewMode,
  selectedLinesheet,
  linesheets,
  onSelectLinesheet,
  onOpenAudit,
  onOpenUpload,
  onOpenSellOutUpload,
  onOpenPythonScript,
  onOpenConverter,
  onExportExcel,
  totalProductsCount,
  sellOutUnitsCount,
  language = 'RU',
  onToggleLanguage,
}) => {
  return (
    <header className="border-b border-[#232733] bg-[#0f1117] sticky top-0 z-40 backdrop-blur-md">
      {/* Top Luxury Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Maison & Boutique Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#cbb58b] via-[#a38c5b] to-[#6d5b32] flex items-center justify-center text-[#0c0d10] font-serif font-bold text-xl shadow-md border border-[#dfcda6]/30">
            LS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif text-[#f3f4f6] tracking-wide font-normal">
                Luisa Spagnoli
              </h1>
              <span className="text-xs uppercase tracking-widest text-[#cbb58b] font-medium px-2 py-0.5 rounded border border-[#cbb58b]/30 bg-[#cbb58b]/10">
                FW26 · 226FW
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] flex items-center gap-1.5 mt-0.5 font-light">
              <span className="text-[#cbb58b] font-medium tracking-wide">Wholesale Sell-In & Sell-Out Intelligence</span>
              <span className="text-[#4b5563]">·</span>
              <span className="text-[#d1d5db]">Rep: Luca Gnagnetti</span>
            </p>
          </div>
        </div>

        {/* Dynamic Retailer Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Customer / Retailer Selector matching Image 1 */}
          <div className="relative group flex items-center bg-[#10141f] border border-[#273043] hover:border-[#38bdf8]/60 rounded-md px-3 py-1.5 transition-all shadow-sm">
            {/* Gold Building Icon */}
            <div className="w-7 h-7 rounded bg-[#1e2536]/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] mr-2.5 shrink-0 shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>

            {/* Label & Selected Name */}
            <div className="flex flex-col pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] font-mono leading-none mb-1">
                CLIENTE RETAILER B2B
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold tracking-wide truncate max-w-[190px] sm:max-w-[260px]">
                  {selectedRetailer === 'ALL' ? 'Tutti i Retailer (Consolidato)' : selectedRetailer}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Full-overlay accessible select */}
            <select
              aria-label="Seleziona cliente B2B attingendo da Retailers"
              value={selectedRetailer}
              onChange={(e) => onSelectRetailer(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            >
              {retailers.length > 1 && (
                <option value="ALL" className="bg-[#10141f] text-white">
                  Tutti i Clienti (Consolidato · {retailers.length} Retailer)
                </option>
              )}
              {retailers.map((r) => (
                <option key={r} value={r} className="bg-[#10141f] text-white">
                  {r}
                </option>
              ))}
            </select>

            {retailerCustomerCode && (
              <div className="hidden lg:flex items-center gap-1.5 ml-2.5 pl-2.5 border-l border-[#273043] text-[11px] text-[#9ca3af]">
                <span className="px-1.5 py-0.5 rounded bg-[#1c2233] text-[#cbb58b] font-mono font-medium">
                  ID {retailerCustomerCode}
                </span>
                {retailerCity && (
                  <span className="text-[#cbd5e1]">
                    {retailerCity}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Language Switcher RU / IT */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#10141f] border border-[#273043] hover:border-[#cbb58b]/60 text-xs font-mono font-medium text-[#e2e8f0] transition-colors"
              title="Cambia lingua interfaccia schede (Rostov Boutique RU / Showroom Milano IT)"
            >
              <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className={language === 'RU' ? 'text-[#38bdf8] font-bold' : 'text-stone-400'}>RU</span>
              <span className="text-stone-600">/</span>
              <span className={language === 'IT' ? 'text-[#cbb58b] font-bold' : 'text-stone-400'}>IT</span>
            </button>
          )}

          {/* Action buttons */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#1a2e22] text-[#6ee7b7] border border-[#059669]/40 hover:bg-[#059669]/20 transition-colors shadow-sm"
            title="Verifica matematica closed-loop a zero errori"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Audit Loop</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#171a23] text-[#e5e7eb] border border-[#2c3242] hover:border-[#cbb58b]/50 hover:text-[#cbb58b] transition-colors"
            title="Esporta foglio Excel consolidato (SheetJS)"
          >
            <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span>Export XLSX</span>
          </button>

          {/* Sell-Out Status & Upload Button */}
          <button
            onClick={onOpenSellOutUpload}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors shadow-sm ${
              sellOutUnitsCount > 0
                ? 'bg-[#0e2a1e] text-[#6ee7b7] border-[#059669]/50 hover:bg-[#059669]/20'
                : 'bg-[#241c10] text-[#fbbf24] border-[#d97706]/40 hover:bg-[#d97706]/20'
            }`}
            title={
              sellOutUnitsCount > 0
                ? `Sell-Out registrato: ${sellOutUnitsCount} capi venduti`
                : 'I dati attuali sono solo Sell-In. Clicca per caricare il Sell-Out della boutique'
            }
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{sellOutUnitsCount > 0 ? `Sell-Out: ${sellOutUnitsCount} pz` : 'Carica Sell-Out'}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#1f2432] text-[#f3f4f6] border border-[#374151] hover:border-[#cbb58b] transition-colors"
            title="Importa ordini JOOR o file vendite cassa"
          >
            <Upload className="w-3.5 h-3.5 text-[#cbb58b]" />
            <span>Gestione Dati</span>
          </button>

          <button
            onClick={onOpenPythonScript}
            className="p-1.5 rounded text-xs font-medium bg-[#171a23] text-[#9ca3af] border border-[#2c3242] hover:text-[#e5e7eb] transition-colors"
            title="Script Python Pandas / Google Colab"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenConverter}
            className="p-1.5 rounded text-xs font-medium bg-[#171a23] text-[#9ca3af] border border-[#2c3242] hover:text-[#e5e7eb] transition-colors"
            title="Convertitore Formati Cassa & JOOR"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar: Collection Linesheets & Primary Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1a1e28]">
        {/* Linesheet Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-[#6b7280] font-medium mr-1 shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#cbb58b]" /> Linee:
          </span>
          {linesheets.map((ls) => {
            const isSelected = selectedLinesheet === ls;
            return (
              <button
                key={ls}
                onClick={() => onSelectLinesheet(ls)}
                className={`text-xs px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#cbb58b] text-[#0c0d10] font-semibold shadow-sm'
                    : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1a1e28]'
                }`}
              >
                {ls === 'ALL' ? `Tutte le Linee (${totalProductsCount})` : ls}
              </button>
            );
          })}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#141720] p-0.5 rounded border border-[#232836]">
          <button
            onClick={() => onSelectViewMode('lookbook')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'lookbook'
                ? 'bg-[#232836] text-[#cbb58b] font-medium shadow'
                : 'text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Lookbook</span>
          </button>

          <button
            onClick={() => onSelectViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-[#232836] text-[#cbb58b] font-medium shadow'
                : 'text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabella</span>
          </button>

          <button
            onClick={() => onSelectViewMode('silhouettes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'silhouettes'
                ? 'bg-[#232836] text-[#cbb58b] font-medium shadow'
                : 'text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Silhouette Mix</span>
          </button>

          <button
            onClick={() => onSelectViewMode('sizes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'sizes'
                ? 'bg-[#232836] text-[#cbb58b] font-medium shadow'
                : 'text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Matrice Taglie</span>
          </button>

          <button
            onClick={() => onSelectViewMode('po-compare')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              viewMode === 'po-compare'
                ? 'bg-[#232836] text-[#cbb58b] font-medium shadow'
                : 'text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>PO Compare</span>
          </button>
        </div>
      </div>
    </header>
  );
};
