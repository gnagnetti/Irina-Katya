/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { FilterState, SellOutStatus } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  silhouettes: string[];
  poNumbers: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  silhouettes,
  poNumbers,
  totalResults,
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      linesheet: 'ALL',
      silhouette: 'ALL',
      sellOutStatus: 'ALL',
      poNumber: 'ALL',
      sortBy: 'sellOutDesc',
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.silhouette !== 'ALL' ||
    filters.sellOutStatus !== 'ALL' ||
    filters.poNumber !== 'ALL' ||
    filters.linesheet !== 'ALL';

  return (
    <div className="bg-[#12141c] border border-[#232733] rounded p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          type="text"
          value={filters.search}
          onChange={handleSearch}
          placeholder="Cerca modello (es. Faggi, Salsedine), cod. 100656, lana, alpaca, colore..."
          className="w-full bg-[#171a23] border border-[#2b3142] rounded pl-9 pr-8 py-2 text-xs text-[#f3f4f6] placeholder-[#6b7280] focus:outline-none focus:border-[#cbb58b] transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#f3f4f6]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Silhouette selector */}
        <select
          aria-label="Filter by silhouette"
          value={filters.silhouette}
          onChange={(e) => onFilterChange({ ...filters, silhouette: e.target.value })}
          className="bg-[#171a23] border border-[#2b3142] text-[#e5e7eb] rounded px-2.5 py-2 text-xs outline-none focus:border-[#cbb58b] cursor-pointer"
        >
          <option value="ALL">Tutte le Categorie ({silhouettes.length})</option>
          {silhouettes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Sell-out performance status */}
        <select
          aria-label="Filter by sell-out status"
          value={filters.sellOutStatus}
          onChange={(e) =>
            onFilterChange({ ...filters, sellOutStatus: e.target.value as SellOutStatus })
          }
          className="bg-[#171a23] border border-[#2b3142] text-[#e5e7eb] rounded px-2.5 py-2 text-xs outline-none focus:border-[#cbb58b] cursor-pointer"
        >
          <option value="ALL">Tutti gli Stati Sell-Out</option>
          <option value="BESTSELLER">★ Bestseller (≥ 70%)</option>
          <option value="HEALTHY">● Regolare (40% - 69%)</option>
          <option value="SLOW">▼ Slow Mover (&lt; 40%)</option>
          <option value="OUT_OF_STOCK">✕ Esaurito (Stock 0)</option>
        </select>

        {/* PO filter */}
        <select
          aria-label="Filter by purchase order"
          value={filters.poNumber}
          onChange={(e) => onFilterChange({ ...filters, poNumber: e.target.value })}
          className="bg-[#171a23] border border-[#2b3142] text-[#e5e7eb] rounded px-2.5 py-2 text-xs outline-none focus:border-[#cbb58b] cursor-pointer"
        >
          <option value="ALL">Tutti i Purchase Orders</option>
          {poNumbers.map((po) => (
            <option key={po} value={po}>
              PO #{po}
            </option>
          ))}
        </select>

        {/* Sort by */}
        <div className="flex items-center gap-1 bg-[#171a23] border border-[#2b3142] rounded px-2 py-1">
          <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
          <select
            aria-label="Sort products by"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="bg-transparent text-[#e5e7eb] text-xs outline-none cursor-pointer pr-1"
          >
            <option value="sellOutDesc" className="bg-[#171a23]">
              Sell-Out % (Decrescente)
            </option>
            <option value="unitsDesc" className="bg-[#171a23]">
              Capi Ordinati (Volume)
            </option>
            <option value="wholesaleDesc" className="bg-[#171a23]">
              Valore Wholesale (€)
            </option>
            <option value="retailDesc" className="bg-[#171a23]">
              Valore Retail (€)
            </option>
            <option value="nameAsc" className="bg-[#171a23]">
              Nome Modello (A-Z)
            </option>
          </select>
        </div>

        {/* Reset filter if active */}
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#f87171] hover:bg-[#ef4444]/10 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Azzera</span>
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="text-[#9ca3af] text-xs">
        <span className="font-semibold text-[#f3f4f6]">{totalResults}</span> stili visualizzati
      </div>
    </div>
  );
};
