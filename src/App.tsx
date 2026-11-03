/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FilterState, 
  MergedProduct, 
  OrderItem, 
  SellOutItem,
  VerificationAuditReport, 
  ViewMode 
} from './types';
import { PackageCheck, Upload } from 'lucide-react';
import { 
  mergeOrderAndSellOut, 
  parseJoorCsv, 
  runSellOutVerificationAudit,
  generateDemoSellOutRecords
} from './utils/etl';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { TableView } from './components/TableView';
import { SilhouetteBreakdown } from './components/SilhouetteBreakdown';
import { SizeMatrixView } from './components/SizeMatrixView';
import { PoComparisonView } from './components/PoComparisonView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ModelTrainingSheet } from './components/ModelTrainingSheet';
import { VerificationLoopModal } from './components/VerificationLoopModal';
import { FileUploadModal } from './components/FileUploadModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { DataEngineerConverterModal } from './components/DataEngineerConverterModal';
import * as XLSX from 'xlsx';

const LOCAL_STORAGE_WORKSPACE_KEY = 'smykova-workspace-v5-5228';

export default function App() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [sellOutItems, setSellOutItems] = useState<SellOutItem[]>(() => {
    try {
      const cached = localStorage.getItem('smykova-uploaded-sellout');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // By default: ZERO sell-out! Pure Sell-In!
  });
  const [selectedRetailer, setSelectedRetailer] = useState<string>('Ip Smykov Igor Viktorovich');
  const [language, setLanguage] = useState<'RU' | 'IT'>('RU');
  const [viewMode, setViewMode] = useState<ViewMode>('lookbook');
  const [selectedLinesheet, setSelectedLinesheet] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploadModalTab, setUploadModalTab] = useState<'sell-out' | 'sell-in'>('sell-out');

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    linesheet: 'ALL',
    silhouette: 'ALL',
    sellOutStatus: 'ALL',
    poNumber: 'ALL',
    sortBy: 'sellOutDesc',
  });

  // Modals
  const [detailProduct, setDetailProduct] = useState<MergedProduct | null>(null);
  const [trainingProduct, setTrainingProduct] = useState<MergedProduct | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPythonScriptOpen, setIsPythonScriptOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  // Load initial orders from CSV or LocalStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_WORKSPACE_KEY);
        if (cached) {
          const parsedCached = JSON.parse(cached);
          if (Array.isArray(parsedCached) && parsedCached.length > 0) {
            const cachedUnits = parsedCached.reduce((acc: number, it: OrderItem) => acc + (it.units || 0), 0);
            if (cachedUnits === 5228) {
              setOrders(parsedCached);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fetch CSV from assets
        let response = await fetch('/assets/aistudio/Ordini_CSV_82299fcf.csv');
        if (!response.ok) {
          response = await fetch('./assets/aistudio/Ordini_CSV_82299fcf.csv');
        }

        if (response.ok) {
          const csvText = await response.text();
          const parsed = parseJoorCsv(csvText);
          if (parsed.length > 0) {
            const totalLoadedUnits = parsed.reduce((acc, it) => acc + (it.units || 0), 0);
            console.log(`[Verification Loop] Acquisiti ${totalLoadedUnits} capi Sell-In dal file CSV (Target: 5228 capi).`);
            setOrders(parsed);
            localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error('Error loading initial orders dataset:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Dynamic unique retailers extracted from loaded Sell-In data
  const retailers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.retailer && o.retailer.trim()) {
        set.add(o.retailer.trim());
      }
    });
    return Array.from(set).sort();
  }, [orders]);

  // Set default retailer to 'Ip Smykov Igor Viktorovich' or first available
  useEffect(() => {
    if (retailers.length > 0) {
      if (selectedRetailer !== 'ALL' && !retailers.includes(selectedRetailer)) {
        const preferred = retailers.find(r => r.toLowerCase().includes('smykov')) || retailers[0];
        setSelectedRetailer(preferred);
      }
    }
  }, [retailers, selectedRetailer]);

  // Filter orders by chosen retailer
  const retailerFilteredOrders = useMemo(() => {
    if (selectedRetailer === 'ALL') {
      return orders;
    }
    return orders.filter(
      (o) => o.retailer?.toLowerCase().trim() === selectedRetailer.toLowerCase().trim()
    );
  }, [orders, selectedRetailer]);

  // Consolidated products from current retailer selection and optional sell-out
  const products = useMemo(() => {
    return mergeOrderAndSellOut(retailerFilteredOrders, sellOutItems);
  }, [retailerFilteredOrders, sellOutItems]);

  const totalSellOutUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.unitsSold, 0);
  }, [products]);

  // Retailer metadata details
  const selectedRetailerInfo = useMemo(() => {
    const matching = retailerFilteredOrders[0] || orders[0];
    if (!matching) return undefined;
    return {
      customerCode: matching.customerCode || '39646',
      city: matching.city || 'Rostov On Don',
      country: matching.country || 'Russia',
      door: matching.door || '',
    };
  }, [retailerFilteredOrders, orders]);

  // Distinct linesheets
  const linesheets = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.linesheet) set.add(o.linesheet);
    });
    return ['ALL', ...Array.from(set)];
  }, [orders]);

  // Distinct silhouettes
  const silhouettes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.silhouette) set.add(p.silhouette);
    });
    return Array.from(set).sort();
  }, [products]);

  // Distinct POs
  const poNumbers = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.poNumbers.forEach((po) => set.add(po));
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Linesheet filter (top tab or dropdown)
        const targetLinesheet =
          selectedLinesheet !== 'ALL' ? selectedLinesheet : filters.linesheet;
        if (targetLinesheet !== 'ALL' && p.linesheet !== targetLinesheet) {
          return false;
        }

        // Silhouette filter
        if (filters.silhouette !== 'ALL' && p.silhouette !== filters.silhouette) {
          return false;
        }

        // PO filter
        if (filters.poNumber !== 'ALL' && !p.poNumbers.includes(filters.poNumber)) {
          return false;
        }

        // Sell-out status filter
        if (filters.sellOutStatus === 'BESTSELLER' && p.sellOutPct < 70) {
          return false;
        }
        if (
          filters.sellOutStatus === 'HEALTHY' &&
          (p.sellOutPct < 40 || p.sellOutPct >= 70)
        ) {
          return false;
        }
        if (filters.sellOutStatus === 'SLOW' && p.sellOutPct >= 40) {
          return false;
        }
        if (filters.sellOutStatus === 'OUT_OF_STOCK' && p.stockRemaining > 0) {
          return false;
        }

        // Search text
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchName = p.styleName.toLowerCase().includes(q);
          const matchClean = p.styleClean.toLowerCase().includes(q);
          const matchNumber = p.styleNumber.toLowerCase().includes(q);
          const matchColor = p.colorCode.toLowerCase().includes(q);
          const matchFabric = p.fabrication.toLowerCase().includes(q);
          const matchTags = p.styleTags.toLowerCase().includes(q);
          if (
            !matchName &&
            !matchClean &&
            !matchNumber &&
            !matchColor &&
            !matchFabric &&
            !matchTags
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'sellOutDesc':
            return b.sellOutPct - a.sellOutPct;
          case 'unitsDesc':
            return b.unitsOrdered - a.unitsOrdered;
          case 'wholesaleDesc':
            return b.totalWholesaleEur - a.totalWholesaleEur;
          case 'retailDesc':
            return b.totalRetailEur - a.totalRetailEur;
          case 'nameAsc':
            return a.styleName.localeCompare(b.styleName);
          default:
            return 0;
        }
      });
  }, [products, selectedLinesheet, filters]);

  // Verification audit report
  const auditReport: VerificationAuditReport = useMemo(() => {
    return runSellOutVerificationAudit(products);
  }, [products]);

  // Handlers for data upload and reset
  const handleApplyNewOrders = (newOrders: OrderItem[]) => {
    setOrders(newOrders);
    localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, JSON.stringify(newOrders));
  };

  const handleResetToDefault = async () => {
    localStorage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY);
    try {
      const response = await fetch('/assets/aistudio/Ordini_CSV_82299fcf.csv');
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseJoorCsv(csvText);
        setOrders(parsed);
        localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Error resetting dataset:', e);
    }
  };

  const handleApplySellOut = (newSellOut: SellOutItem[]) => {
    setSellOutItems(newSellOut);
    localStorage.setItem('smykova-uploaded-sellout', JSON.stringify(newSellOut));
  };

  const handleClearSellOut = () => {
    setSellOutItems([]);
    localStorage.removeItem('smykova-uploaded-sellout');
  };

  const handleOpenUpload = (tab: 'sell-out' | 'sell-in' = 'sell-in') => {
    setUploadModalTab(tab);
    setIsUploadOpen(true);
  };

  const handleExportExcel = () => {
    const exportRows = filteredProducts.map((p) => ({
      'Codice Modello': p.styleNumber,
      'Nome Modello': p.styleName,
      'Linea Collezione': p.linesheet,
      'Silhouette': p.silhouette,
      'Tessuto & Composizione': p.fabrication,
      'Colore': p.colorCode,
      'Prezzo Sell-In B2B (€)': p.wholesaleEur,
      'Prezzo MSRP Retail (€)': p.suggRetailEur,
      'Markup Ratio': p.markup,
      'Capi Sell-In Ordinati': p.unitsOrdered,
      'Capi Sell-Out Venduti': p.unitsSold,
      'Giacenza Residua': p.stockRemaining,
      'Sell-Out (%)': p.sellOutPct,
      'Totale Sell-In (€)': p.totalWholesaleEur,
      'Incasso Realizzato (€)': p.realizedRevenueEur,
      'PO Numbers': p.poNumbers.join(', '),
      'Origine': p.countryOfOrigin,
      'Cliente Retailer': selectedRetailer !== 'ALL' ? selectedRetailer : 'Consolidato',
      'Città': selectedRetailerInfo?.city || 'Rostov On Don',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Luisa Spagnoli FW26');
    const safeName = (selectedRetailer !== 'ALL' ? selectedRetailer : 'Consolidato').replace(/[^\w-]/g, '_');
    XLSX.writeFile(
      wb,
      `Luisa_Spagnoli_FW26_SellIn_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#e5e7eb] flex flex-col font-sans">
      {/* 1. Header with brand identity, retailer selector, linesheets & views */}
      <Header
        selectedRetailer={selectedRetailer}
        retailers={retailers}
        onSelectRetailer={setSelectedRetailer}
        retailerCustomerCode={selectedRetailerInfo?.customerCode}
        retailerCity={selectedRetailerInfo?.city}
        retailerCountry={selectedRetailerInfo?.country}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        selectedLinesheet={selectedLinesheet}
        linesheets={linesheets}
        onSelectLinesheet={setSelectedLinesheet}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenUpload={() => handleOpenUpload('sell-in')}
        onOpenSellOutUpload={() => handleOpenUpload('sell-out')}
        onOpenPythonScript={() => setIsPythonScriptOpen(true)}
        onOpenConverter={() => setIsConverterOpen(true)}
        onExportExcel={handleExportExcel}
        totalProductsCount={products.length}
        sellOutUnitsCount={totalSellOutUnits}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'RU' ? 'IT' : 'RU'))}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading state */}
        {isLoading ? (
          <div className="p-16 text-center text-[#9ca3af] flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#cbb58b] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-lg text-[#f3f4f6]">
              Caricamento Catalogo Luisa Spagnoli FW26 & Ordini JOOR (Sell-In)...
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              Sanitizzazione codici sartoriali e caricamento ordini B2B per retailer in corso.
            </p>
          </div>
        ) : (
          <>
            {/* 2. Executive KPI Metrics */}
            <KpiMetrics products={filteredProducts} />

            {/* Sell-In Only Informative Banner */}
            {totalSellOutUnits === 0 ? (
              <div className="mb-6 p-4 rounded bg-[#131620] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#cbb58b]/10 border border-[#cbb58b]/30 flex items-center justify-center text-[#cbb58b] shrink-0">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#f3f4f6]">
                        Stato Collezione: Solo Sell-In B2B Caricato
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1c2230] text-[#cbb58b] border border-[#cbb58b]/30">
                        Giacenza 100% ({filteredProducts.reduce((acc, p) => acc + p.unitsOrdered, 0)} capi ordinati)
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-0.5 font-light">
                      I capi attualmente visualizzati sono ordini wholesale di Sell-In (5.228 capi totali). Il Sell-Out della boutique può essere caricato da file POS o simulato.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplySellOut(generateDemoSellOutRecords(products))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#1a2336] hover:bg-[#222e47] text-[#93c5fd] border border-[#3b82f6]/40 transition-colors shadow-sm cursor-pointer"
                    title="Popola le schede con vendite sell-out dimostrative per visualizzare il layout di cassa (Image 2)"
                  >
                    <span>Simula Vendite POS (Look Image 2)</span>
                  </button>
                  <button
                    onClick={() => handleOpenUpload('sell-out')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-[#cbb58b] text-[#0c0d10] hover:bg-[#dfcda6] transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica Dati Sell-Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex items-center justify-between text-xs text-[#9ca3af] bg-[#121622] border border-[#202738] px-3.5 py-2 rounded-md">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Dati Sell-Out attivi: {totalSellOutUnits} capi registrati a cassa</span>
                </span>
                <button
                  onClick={handleClearSellOut}
                  className="text-stone-400 hover:text-red-400 transition-colors font-mono underline"
                >
                  Torna a Solo Sell-In (0 venduto)
                </button>
              </div>
            )}

            {/* 3. Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              silhouettes={silhouettes}
              poNumbers={poNumbers}
              totalResults={filteredProducts.length}
            />

            {/* 4. Active View Content */}
            {viewMode === 'lookbook' && (
              <div>
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center text-[#9ca3af] bg-[#12141c] border border-[#232733] rounded">
                    Nessun capo trovato con i filtri selezionati. Prova a modificare la ricerca o azzerare i filtri.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onOpenDetail={setDetailProduct}
                        onOpenTraining={setTrainingProduct}
                        language={language}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'table' && (
              <TableView
                products={filteredProducts}
                onOpenDetail={setDetailProduct}
                onOpenTraining={setTrainingProduct}
                boutiqueName={selectedRetailer !== 'ALL' ? selectedRetailer : 'Tutti i Retailer'}
              />
            )}

            {viewMode === 'silhouettes' && (
              <SilhouetteBreakdown
                products={filteredProducts}
                onSelectSilhouette={(sil) => {
                  setFilters({ ...filters, silhouette: sil });
                  setViewMode('lookbook');
                }}
              />
            )}

            {viewMode === 'sizes' && (
              <SizeMatrixView
                products={filteredProducts}
                onOpenDetail={setDetailProduct}
              />
            )}

            {viewMode === 'po-compare' && (
              <PoComparisonView
                products={products}
                onSelectPo={(po) => {
                  setFilters({ ...filters, poNumber: po });
                  setViewMode('lookbook');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2330] bg-[#0c0e14] py-6 text-xs text-[#6b7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-[#9ca3af]">Luisa Spagnoli</span>
            <span>·</span>
            <span>Autunno/Inverno 2026 (FW26 / 226FW)</span>
            <span>·</span>
            <span className="text-[#cbb58b] font-medium">Wholesale Sell-In & Sell-Out Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[#9ca3af]">
            <span>
              Cliente: {selectedRetailer !== 'ALL' ? selectedRetailer : 'Consolidato (Tutti i Retailer)'}
              {selectedRetailerInfo?.customerCode ? ` (ID ${selectedRetailerInfo.customerCode})` : ''}
            </span>
            <span>·</span>
            <span>Rappresentante: Luca Gnagnetti</span>
            <span>·</span>
            <button
              onClick={() => setIsAuditOpen(true)}
              className="text-[#6ee7b7] hover:underline"
            >
              Zero-Discrepancy Audit Pass
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOpenTraining={(prod) => {
            setDetailProduct(null);
            setTrainingProduct(prod);
          }}
        />
      )}

      {trainingProduct && (
        <ModelTrainingSheet
          product={trainingProduct}
          onClose={() => setTrainingProduct(null)}
          allProducts={products}
          onSelectProduct={(prod) => setTrainingProduct(prod)}
        />
      )}

      {isAuditOpen && (
        <VerificationLoopModal
          auditReport={auditReport}
          onClose={() => setIsAuditOpen(false)}
          boutiqueName={selectedRetailer !== 'ALL' ? selectedRetailer : 'Consolidato Retailers'}
        />
      )}

      {isUploadOpen && (
        <FileUploadModal
          onClose={() => setIsUploadOpen(false)}
          onApplyNewOrders={handleApplyNewOrders}
          onApplySellOut={handleApplySellOut}
          onClearSellOut={handleClearSellOut}
          onResetToDefault={handleResetToDefault}
          currentOrdersCount={orders.length}
          currentSellOutCount={totalSellOutUnits}
          initialTab={uploadModalTab}
          products={products}
        />
      )}

      {isPythonScriptOpen && (
        <PythonScriptModal onClose={() => setIsPythonScriptOpen(false)} />
      )}

      {isConverterOpen && (
        <DataEngineerConverterModal onClose={() => setIsConverterOpen(false)} />
      )}
    </div>
  );
}
