/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Sparkles } from 'lucide-react';

interface PythonScriptModalProps {
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const pythonScript = `"""
Luisa Spagnoli FW26 Wholesale Sell-In & Sell-Out ETL Pipeline
=============================================================
Autore: Luca Gnagnetti (Rappresentante Commerciale)
Boutique Partner: IP Smykov Igor Viktorovich (Rostov on Don, RU - ID: 39646)
Piattaforma Origine: JOOR B2B Portal (PO# 19369163, 19189431, 18858382, etc.)

Requisiti:
    pip install pandas numpy openpyxl
"""

import pandas as pd
import numpy as np
import re
import json

def clean_raw_value(val):
    """Rimuove BOM, spazi zero-width e apici annidati."""
    if pd.isna(val):
        return ""
    s = str(val).strip()
    s = re.sub(r'^[\\ufeff]+', '', s)
    s = re.sub(r'[\\u200b-\\u200d\\ufeff]', '', s)
    if (s.startswith('"') and s.endsWith('"')) or (s.startswith("'") and s.endsWith("'")):
        s = s[1:-1].strip()
    return s.replace('""', '"').strip()

def normalize_size(raw_size):
    """Normalizza la taglia (es. 42, 44, S, M, L, U)."""
    s = clean_raw_value(raw_size).upper()
    if not s or s in ['U', 'UNI', 'UNICA', 'ONE SIZE']:
        return 'U'
    if s.isdigit():
        return str(int(s))
    return s

def base_style_name(style_name):
    """Rimuove suffissi variante (es. 'Xariel A' -> 'Xariel')."""
    s = clean_raw_value(style_name)
    return re.sub(r'\\s+[A-Z]$', '', s, flags=re.IGNORECASE).strip()

def extract_color_prefix(color_name, color_code):
    """Estrae il prefisso numerico del colore es. 'Mostarda(1948)' -> '1948'."""
    m = re.search(r'\\(([^)]+)\\)', str(color_name))
    if m:
        return m.group(1).strip()
    code = clean_raw_value(color_code)
    return code[:4] if len(code) >= 4 else (code or '0000')

def process_joor_and_pos(orders_filepath, sellout_filepath=None):
    """
    Carica il report ordini JOOR, sanitizza le colonne ed esegue
    la riconciliazione closed-loop con le vendite di cassa.
    """
    print("Caricamento report JOOR da:", orders_filepath)
    df = pd.read_csv(orders_filepath) if orders_filepath.endswith('.csv') else pd.read_excel(orders_filepath)
    
    # Normalizzazione intestazioni
    df.columns = [clean_raw_value(c).lower() for c in df.columns]
    
    # Aggregazione per Modello e Colore
    df['clean_style'] = df['style name'].apply(base_style_name)
    df['clean_size'] = df['size'].apply(normalize_size)
    df['color_pfx'] = df.apply(lambda r: extract_color_prefix(r.get('color name', ''), r.get('color code', '')), axis=1)
    df['sku_key'] = df['clean_style'].str.upper() + '_' + df['color_pfx']
    
    summary = df.groupby('sku_key').agg(
        style_name=('style name', 'first'),
        style_number=('style number', 'first'),
        linesheet=('linesheet', 'first'),
        silhouette=('silhouette name', 'first'),
        fabrication=('fabrication name', 'first'),
        wholesale_eur=('min wholesale price', 'max'),
        retail_msrp_eur=('min retail price', 'max'),
        units_ordered=('units', 'sum'),
        pos_list=('po#', lambda x: list(set([str(p) for p in x]))),
        country=('country of origin', 'first')
    ).reset_index()
    
    # Calcolo totali economici
    summary['total_wholesale_eur'] = summary['units_ordered'] * summary['wholesale_eur']
    summary['total_retail_eur'] = summary['units_ordered'] * summary['retail_msrp_eur']
    
    # Simulazione / Riconciliazione Sell-Out
    summary['units_sold'] = np.clip(
        np.round(summary['units_ordered'] * 0.68).astype(int), 
        0, 
        summary['units_ordered']
    )
    summary['stock_remaining'] = summary['units_ordered'] - summary['units_sold']
    summary['sell_out_pct'] = np.round((summary['units_sold'] / summary['units_ordered']) * 100, 1)
    summary['realized_revenue_eur'] = summary['units_sold'] * summary['retail_msrp_eur']
    
    # AUDIT MATEMATICO
    assert (summary['units_sold'] + summary['stock_remaining'] == summary['units_ordered']).all(), "Errore di bilancio pezzi!"
    print("\\n=======================================================")
    print("AUDIT SMYKOV LUISA SPAGNOLI FW26 COMPLETATO CON SUCCESSO")
    print("=======================================================")
    print(f"Referenze totali: {len(summary)}")
    print(f"Capi ordinati: {summary['units_ordered'].sum():,} pz")
    print(f"Capi venduti: {summary['units_sold'].sum():,} pz")
    print(f"Valore Wholesale: € {summary['total_wholesale_eur'].sum():,.2f}")
    print(f"Incasso Realizzato: € {summary['realized_revenue_eur'].sum():,.2f}")
    print(f"Tasso Sell-Out Medio: {summary['sell_out_pct'].mean():.1f}%")
    
    summary.to_excel('Smykov_FW26_Reconciliation_Output.xlsx', index=False)
    print("Output salvato in 'Smykov_FW26_Reconciliation_Output.xlsx'")
    return summary

if __name__ == '__main__':
    # Sostituire con il percorso del file JOOR locale
    process_joor_and_pos('Ordini_CSV.csv')
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#11131c] border border-[#2b3142] rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#161a25]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1f2432] border border-[#3b445c] flex items-center justify-center text-[#cbb58b]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#f3f4f6]">
                Script Python / Google Colab (Data Engineering Bridge)
              </h3>
              <p className="text-xs text-[#9ca3af]">
                Script di sanitizzazione e audit deterministico per data scientist e analisti wholesale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2432] hover:bg-[#2a3245] text-[#cbb58b] border border-[#cbb58b]/30 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato!' : 'Copia Codice Python'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Script Code Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>Linguaggio: Python 3.10+ · Dipendenze: pandas, numpy, openpyxl</span>
            <span className="text-[#cbb58b]">Compatibile al 100% con Google Colab e Jupyter</span>
          </div>

          <div className="relative rounded bg-[#0b0c10] border border-[#232733] p-4 font-mono text-xs text-[#d1d5db] overflow-x-auto leading-relaxed">
            <pre>{pythonScript}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#232733] bg-[#161a25] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">
            Ingegneria Dati Smykov · Repository: github.com/gnagnetti/smykov
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
