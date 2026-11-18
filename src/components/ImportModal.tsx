import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { parseHoldingsCSV } from '../utils';
import type { Holding } from '../types';
import { fmt } from '../utils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    holdings: Holding[],
    mode: 'replace' | 'append',
    meta?: { freshMoney?: number; singleStockCap?: number }
  ) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [parsedData, setParsedData] = useState<{
    holdings: Holding[];
    freshMoney?: number;
    singleStockCap?: number;
    error?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseHoldingsCSV(text);
      setParsedData(result);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setParsedData(null);
      return;
    }
    const result = parseHoldingsCSV(text);
    setParsedData(result);
  };

  const handleConfirm = () => {
    if (!parsedData || !parsedData.holdings.length) return;
    onImport(parsedData.holdings, importMode, {
      freshMoney: parsedData.freshMoney,
      singleStockCap: parsedData.singleStockCap,
    });
    handleClose();
  };

  const handleClose = () => {
    setParsedData(null);
    setPastedText('');
    onClose();
  };

  const totalImportValue = parsedData?.holdings.reduce((sum, h) => sum + (h.value || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Portfolio Holdings</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2 px-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Upload CSV File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`pb-2 px-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
                activeTab === 'paste'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Paste CSV / CAS Data
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Click to browse or drag and drop your CSV file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports 915am export, Zerodha, Groww, CAMS, or KFintech CSV exports
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Paste copied table rows or CSV content:
              </label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder={'Name,Type,Current Value,Target %\nHDFC Bank,Stock,100000,10\nParag Parikh Flexi Cap,MF,200000,25'}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Validation / Preview Results */}
          {parsedData && (
            <div className="mt-4">
              {parsedData.error ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parsedData.error}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Found <strong>{parsedData.holdings.length}</strong> valid holdings ({fmt(totalImportValue)})
                      </span>
                    </div>
                    {parsedData.freshMoney !== undefined && (
                      <span className="text-xs bg-green-200/50 dark:bg-green-800/50 px-2 py-0.5 rounded">
                        Fresh: {fmt(parsedData.freshMoney)}
                      </span>
                    )}
                  </div>

                  {/* Mode options */}
                  <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Replace current holdings</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Append to existing holdings</span>
                    </label>
                  </div>

                  {/* Preview list */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto text-xs">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-3 py-1.5 text-left text-gray-500 dark:text-gray-300">Name</th>
                          <th className="px-3 py-1.5 text-left text-gray-500 dark:text-gray-300">Type</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-300">Value (₹)</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-300">Target %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {parsedData.holdings.map((h) => (
                          <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-1.5 text-gray-900 dark:text-white font-medium">{h.name}</td>
                            <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">{h.type}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-700 dark:text-gray-300">{fmt(h.value)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-700 dark:text-gray-300">{h.target ? `${h.target}%` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedData || !parsedData.holdings.length}
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Import {parsedData?.holdings.length ? `${parsedData.holdings.length} Holdings` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
