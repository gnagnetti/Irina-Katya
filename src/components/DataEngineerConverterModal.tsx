/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ArrowRight, FileSpreadsheet, Check, Sparkles, RefreshCw } from 'lucide-react';
import { cleanRawValue, normalizeSize, baseStyleName, extractColorPrefix } from '../utils/etl';

interface DataEngineerConverterModalProps {
  onClose: () => void;
}

export const DataEngineerConverterModal: React.FC<DataEngineerConverterModalProps> = ({ onClose }) => {
  const sampleInput = `Capo,CodiceColore,TagliaGrezza,PrezzoWholesale,PrezzoRetail,Venduti
"Xariel A.","Mostarda(1948)"," 042 ",183.0,620.0,2
"Collisione","194800000000","u",258.5,877.0,1
"Dominanza B","Nero_Oro(0101 0002)","  UNI ",60.0,202.0,2`;

  const [inputData, setInputData] = useState(sampleInput);
  const [outputResult, setOutputResult] = useState<string>('');

  const handleConvert = () => {
    try {
      const lines = inputData.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) return;

      const converted = lines.slice(1).map(line => {
        const parts = line.split(',').map(p => cleanRawValue(p));
        const rawStyle = parts[0] || '';
        const rawColor = parts[1] || '';
        const rawSize = parts[2] || '';
        const wholesale = parseFloat(parts[3]) || 0;
        const retail = parseFloat(parts[4]) || 0;
        const units = parseInt(parts[5], 10) || 1;

        return {
          original_style: rawStyle,
          clean_style_name: baseStyleName(rawStyle),
          normalized_size: normalizeSize(rawSize),
          color_prefix: extractColorPrefix(rawColor, rawColor),
          wholesale_eur: wholesale,
          retail_msrp_eur: retail,
          units,
          calculated_markup: wholesale > 0 ? (retail / wholesale).toFixed(2) : '0',
          reconciliation_key: `${baseStyleName(rawStyle).toUpperCase()}_${extractColorPrefix(rawColor, rawColor)}`
        };
      });

      setOutputResult(JSON.stringify(converted, null, 2));
    } catch (err: unknown) {
      setOutputResult(`Errore nella conversione: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  React.useEffect(() => {
    handleConvert();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#11131c] border border-[#2b3142] rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1f2432] border border-[#3b445c] flex items-center justify-center text-[#cbb58b]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#f3f4f6]">
                Convertitore Formati Cassa & JOOR (Data Engineering Workbench)
              </h3>
              <p className="text-xs text-[#9ca3af]">
                Strumento di allineamento per importazioni eterogenee da gestionali cassa locali
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

        {/* Workbench Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Side */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#f3f4f6]">Dati Grezzi Cassa / File Locale (CSV)</span>
                <button
                  onClick={() => {
                    setInputData(sampleInput);
                    handleConvert();
                  }}
                  className="text-[11px] text-[#cbb58b] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ripristina Esempio</span>
                </button>
              </div>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                rows={12}
                className="w-full bg-[#0d0e14] border border-[#232733] rounded p-3 font-mono text-xs text-[#d1d5db] focus:outline-none focus:border-[#cbb58b]"
                placeholder="Incolla qui righe CSV da convertire..."
              />
              <button
                onClick={handleConvert}
                className="mt-2 w-full py-2 rounded bg-[#1f2432] hover:bg-[#283042] text-[#cbb58b] border border-[#cbb58b]/30 font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Esegui Sanitizzazione Deterministica</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Output Side */}
            <div>
              <span className="font-semibold text-[#f3f4f6] block mb-2">
                Output Normalizzato Luisa Spagnoli (JSON Schema)
              </span>
              <pre className="w-full h-[280px] bg-[#0d0e14] border border-[#232733] rounded p-3 font-mono text-xs text-[#6ee7b7] overflow-auto">
                {outputResult}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#232733] bg-[#161a25] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">
            Algoritmi attivi: cleanRawValue · normalizeSize · baseStyleName · extractColorPrefix
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#202533] hover:bg-[#2b3245] text-[#f3f4f6] transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
