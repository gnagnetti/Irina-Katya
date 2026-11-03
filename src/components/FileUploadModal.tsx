/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Download,
  Trash2,
  Package
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cleanRawValue, parseJoorCsv, parseSellOutCsv, generateDemoSellOutRecords } from '../utils/etl';
import { MergedProduct, OrderItem, SellOutItem } from '../types';

interface FileUploadModalProps {
  onClose: () => void;
  onApplyNewOrders: (orders: OrderItem[]) => void;
  onApplySellOut: (sellOut: SellOutItem[]) => void;
  onClearSellOut: () => void;
  onResetToDefault: () => void;
  currentOrdersCount: number;
  currentSellOutCount: number;
  initialTab?: 'sell-out' | 'sell-in';
  products: MergedProduct[];
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  onClose,
  onApplyNewOrders,
  onApplySellOut,
  onClearSellOut,
  onResetToDefault,
  currentOrdersCount,
  currentSellOutCount,
  initialTab = 'sell-out',
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'sell-out' | 'sell-in'>(initialTab);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedOrders, setParsedOrders] = useState<OrderItem[]>([]);
  const [parsedSellOut, setParsedSellOut] = useState<SellOutItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (activeTab === 'sell-in') {
        // Parse wholesale orders
        let csvText = '';
        if (ext === 'csv') {
          csvText = await file.text();
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          csvText = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          throw new Error('Formato non supportato. Usa .csv, .xlsx o .xls.');
        }

        const orders = parseJoorCsv(csvText);
        if (orders.length === 0) {
          throw new Error('Nessuna riga d\'ordine valida riconosciuta nel file.');
        }
        setParsedOrders(orders);
        setSuccessMsg(`Riconosciute ${orders.length} righe d'ordine Sell-In.`);
      } else {
        // Parse boutique sell-out records
        let csvText = '';
        if (ext === 'csv') {
          csvText = await file.text();
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          csvText = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          throw new Error('Formato non supportato. Usa .csv, .xlsx o .xls.');
        }

        const sellOut = parseSellOutCsv(csvText);
        if (sellOut.length === 0) {
          throw new Error(
            'Nessuna registrazione di vendita trovata. Assicurati che il file contenga le colonne "Modello" (o Style Name) e "Quantità Venduta" (o Units Sold).'
          );
        }
        setParsedSellOut(sellOut);
        const totalUnits = sellOut.reduce((sum, s) => sum + s.unitsSold, 0);
        setSuccessMsg(`Riconosciute ${sellOut.length} registrazioni di cassa per un totale di ${totalUnits} capi venduti.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto durante la lettura del file.';
      setErrorMsg(message);
      setParsedOrders([]);
      setParsedSellOut([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (activeTab === 'sell-in' && parsedOrders.length > 0) {
      onApplyNewOrders(parsedOrders);
      onClose();
    } else if (activeTab === 'sell-out' && parsedSellOut.length > 0) {
      onApplySellOut(parsedSellOut);
      onClose();
    }
  };

  const handleLoadDemoSellOut = () => {
    const demo = generateDemoSellOutRecords(products);
    onApplySellOut(demo);
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Generate template rows based on current Sell-In catalog
    const rows = products.flatMap(p => {
      return Object.entries(p.sizesOrdered).map(([sz, qty]) => ({
        'Modello': p.styleName,
        'Codice Articolo': p.styleNumber,
        'Colore': p.colorCode,
        'Taglia': sz,
        'Ordinato Sell-In (Pz)': qty,
        'Venduto Sell-Out (Pz)': 0,
        'Prezzo Vendita Retail (€)': p.suggRetailEur,
        'Data Vendita': '',
        'Note Cassa': '',
      }));
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_SellOut');
    XLSX.writeFile(wb, 'Luisa_Spagnoli_FW26_Template_SellOut_Boutique.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#11131c] border border-[#2b3142] rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1f2432] border border-[#3b445c] flex items-center justify-center text-[#cbb58b]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#f3f4f6]">
                Gestione Dati: Sell-In Wholesale & Sell-Out Boutique
              </h3>
              <p className="text-xs text-[#9ca3af]">
                Carica gli ordini d'acquisto B2B o registra le vendite al dettaglio della cassa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202533] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#232733] bg-[#0e1017] px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('sell-out');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sell-out'
                ? 'border-[#cbb58b] text-[#cbb58b]'
                : 'border-transparent text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Carica Sell-Out Boutique (Cassa / POS)</span>
            {currentSellOutCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#065f46] text-[#6ee7b7]">
                Attivo ({currentSellOutCount} pz)
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2a2318] text-[#f59e0b]">
                In Attesa (0 pz)
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('sell-in');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sell-in'
                ? 'border-[#cbb58b] text-[#cbb58b]'
                : 'border-transparent text-[#9ca3af] hover:text-[#e5e7eb]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Ordini Sell-In (JOOR B2B)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e2330] text-[#9ca3af]">
              {currentOrdersCount} righe
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {activeTab === 'sell-out' ? (
            /* SELL-OUT TAB */
            <div className="space-y-4">
              <div className="p-3.5 rounded bg-[#161a25] border border-[#2b3142] flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-[#f3f4f6]">
                    Caricamento Vendite al Dettaglio (Sell-Out)
                  </h4>
                  <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                    I pezzi caricati dal catalogo JOOR sono <strong>esclusivamente Sell-In (Wholesale)</strong>. 
                    Puoi caricare qui il foglio delle vendite della boutique (export cassa 1C/POS in .xlsx o .csv) 
                    per calcolare rotazione, incassi effettivi e giacenze residue in tempo reale.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2432] text-[#cbb58b] border border-[#cbb58b]/30 hover:border-[#cbb58b] shrink-0 font-medium transition-colors"
                  title="Scarica foglio Excel pre-compilato con tutti i modelli FW26 ordinati"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Scarica Template Excel</span>
                </button>
              </div>

              {/* Drag & Drop Area for Sell-Out */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-[#cbb58b] bg-[#cbb58b]/5'
                    : 'border-[#2c3242] hover:border-[#3e465c] bg-[#141722]'
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 mx-auto text-[#cbb58b] mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#f3f4f6] mb-1">
                  Trascina qui il file Sell-Out della cassa o selezionalo dal dispositivo
                </p>
                <p className="text-xs text-[#9ca3af] mb-3">
                  Riconosce colonne: <em>Modello/Style, Taglia/Size, Quantità Venduta/Units Sold, Prezzo Retail</em> (.xlsx, .csv)
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1f2432] hover:bg-[#2a3245] text-[#cbb58b] border border-[#cbb58b]/40 cursor-pointer font-medium transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Sfoglia File Cassa (.xlsx / .csv)</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Actions: Clear Sell-Out & Demo Fill */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {currentSellOutCount > 0 && (
                    <button
                      onClick={() => {
                        onClearSellOut();
                        setParsedSellOut([]);
                        setSuccessMsg('Sell-Out azzerato: catalogo ripristinato a 100% Sell-In.');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#2b1717] hover:bg-[#3d1e1e] text-[#f87171] border border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Azzera Sell-Out (Torna a 0 venduti)</span>
                    </button>
                  )}

                  <button
                    onClick={handleLoadDemoSellOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#171a23] hover:bg-[#202533] text-[#cbb58b] border border-[#374151] transition-colors"
                    title="Simula un sell-out realistico per testare grafici e matrici"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Carica Dati Demo Sell-Out (Simulazione Test)</span>
                  </button>
                </div>

                <span className="text-xs text-[#6b7280]">
                  Giacenza attuale: {currentSellOutCount === 0 ? '100% in stock (Nessuna vendita registrata)' : `${currentSellOutCount} capi venduti`}
                </span>
              </div>
            </div>
          ) : (
            /* SELL-IN TAB */
            <div className="space-y-4">
              <div className="p-3.5 rounded bg-[#161a25] border border-[#2b3142]">
                <h4 className="font-medium text-[#f3f4f6]">
                  Caricamento Ordini B2B Wholesale (Sell-In)
                </h4>
                <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                  Supporta l'export originale da <strong>JOOR B2B Portal</strong> contenente le colonne <em>Retailer, Style Name, Color Name, size, Units, Min Wholesale Price, Min Retail Price, Linesheet, Silhouette Name</em>.
                </p>
              </div>

              {/* Drag & Drop Area for Sell-In */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-[#cbb58b] bg-[#cbb58b]/5'
                    : 'border-[#2c3242] hover:border-[#3e465c] bg-[#141722]'
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 mx-auto text-[#cbb58b] mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#f3f4f6] mb-1">
                  Trascina qui il file ordini JOOR oppure selezionalo dal dispositivo
                </p>
                <p className="text-xs text-[#9ca3af] mb-3">
                  File export JOOR (.xlsx, .csv con codifica UTF-8)
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1f2432] hover:bg-[#2a3245] text-[#cbb58b] border border-[#cbb58b]/40 cursor-pointer font-medium transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Sfoglia File Ordini JOOR</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onResetToDefault}
                  className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#f87171] transition-colors"
                  title="Ripristina il file ordini predefinito Luisa Spagnoli FW26"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ripristina Ordini Predefiniti (FW26)</span>
                </button>

                <span className="text-xs text-[#6b7280]">
                  Workspace attuale: {currentOrdersCount} ordini
                </span>
              </div>
            </div>
          )}

          {/* Feedback & Preview */}
          {isProcessing && (
            <div className="p-3.5 rounded bg-[#161a25] border border-[#2b3142] text-center text-[#9ca3af]">
              Elaborazione dati tramite SheetJS in corso...
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded bg-[#451a1a]/40 border border-red-500/40 text-red-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded bg-[#064e3b]/20 border border-[#059669]/40 text-[#6ee7b7] flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sell-Out Preview */}
          {parsedSellOut.length > 0 && activeTab === 'sell-out' && (
            <div className="p-3.5 rounded bg-[#161a25] border border-[#2b3142] space-y-2">
              <div className="font-semibold text-[#f3f4f6] pb-1 border-b border-[#232733] flex justify-between">
                <span>Anteprima Registrazioni Sell-Out Cassa Riconosciute:</span>
                <span className="text-[#34d399] font-mono">{parsedSellOut.length} righe</span>
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[11px] text-[#9ca3af] divide-y divide-[#1e2330]">
                {parsedSellOut.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-[#e5e7eb]">{s.styleName} (Tg. {s.size || 'U'})</span>
                    <span className="text-[#34d399] font-semibold">{s.unitsSold} pz venduti</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sell-In Preview */}
          {parsedOrders.length > 0 && activeTab === 'sell-in' && (
            <div className="p-3.5 rounded bg-[#161a25] border border-[#2b3142] space-y-2">
              <div className="font-semibold text-[#f3f4f6] pb-1 border-b border-[#232733] flex justify-between">
                <span>Anteprima Ordini Sell-In Riconosciuti:</span>
                <span className="text-[#cbb58b] font-mono">{parsedOrders.length} righe</span>
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[11px] text-[#9ca3af] divide-y divide-[#1e2330]">
                {parsedOrders.slice(0, 5).map((o, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-[#e5e7eb]">{o.styleName} ({o.styleNumber})</span>
                    <span>{o.units} pz · €{o.minWholesalePrice} WHS</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#232733] bg-[#161a25] flex items-center justify-between">
          <span className="text-[11px] text-[#6b7280]">
            {activeTab === 'sell-out'
              ? 'Le vendite aggiorneranno immediatamente le percentuali di Sell-Out e gli incassi.'
              : 'Gli ordini aggiorneranno il catalogo wholesale B2B del buyer.'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#171a23] text-[#9ca3af] hover:text-[#f3f4f6] border border-[#2b3142] transition-colors text-xs"
            >
              Chiudi
            </button>
            <button
              onClick={handleApply}
              disabled={
                (activeTab === 'sell-in' && parsedOrders.length === 0) ||
                (activeTab === 'sell-out' && parsedSellOut.length === 0)
              }
              className={`px-5 py-2 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                (activeTab === 'sell-in' && parsedOrders.length > 0) ||
                (activeTab === 'sell-out' && parsedSellOut.length > 0)
                  ? 'bg-[#cbb58b] hover:bg-[#dfcda6] text-[#0c0d10] cursor-pointer'
                  : 'bg-[#232733] text-[#6b7280] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {activeTab === 'sell-out'
                  ? 'Applica Dati Sell-Out'
                  : 'Applica Ordini Sell-In'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
