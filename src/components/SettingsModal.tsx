import React from 'react';
import { X, Settings2, Moon, Sun, Monitor, Check } from 'lucide-react';
import { AppSettings, SupportedLanguage, CurrencyCode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AU$)' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real (R$)' }
];

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Settings2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {settings.language === 'it' ? 'Impostazioni' : 'Settings'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Language */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2.5">
              {settings.language === 'it' ? 'Lingua dell\'applicazione' : 'Language'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onUpdateSettings({ language: lang.code })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    settings.language === lang.code
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {settings.language === lang.code && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2.5">
              {settings.language === 'it' ? 'Tema visivo' : 'Theme'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: settings.language === 'it' ? 'Chiaro' : 'Light', icon: Sun },
                { id: 'dark', label: settings.language === 'it' ? 'Scuro' : 'Dark', icon: Moon },
                { id: 'system', label: settings.language === 'it' ? 'Sistema' : 'System', icon: Monitor }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id as any })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      settings.theme === t.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2.5">
              {settings.language === 'it' ? 'Simbolo di valuta' : 'Currency Symbol'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onUpdateSettings({ currency: { code: c.code, symbol: c.symbol } })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    settings.currency.code === c.code
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{c.label}</span>
                  {settings.currency.code === c.code && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Precision and Separators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2.5">
                {settings.language === 'it' ? 'Cifre decimali' : 'Decimal Precision'}
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onUpdateSettings({ decimalPrecision: p })}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                      settings.decimalPrecision === p
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2.5">
                {settings.language === 'it' ? 'Separatore decimale' : 'Decimal Separator'}
              </label>
              <div className="flex items-center gap-2">
                {[
                  { sep: ',', label: settings.language === 'it' ? 'Virgola (,)' : 'Comma (,)' },
                  { sep: '.', label: settings.language === 'it' ? 'Punto (.)' : 'Dot (.)' }
                ].map((s) => (
                  <button
                    key={s.sep}
                    type="button"
                    onClick={() => onUpdateSettings({ decimalSeparator: s.sep as any })}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                      settings.decimalSeparator === s.sep
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* On-screen Keypad toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                {settings.language === 'it' ? 'Tastierino rapido a schermo' : 'On-screen Quick Keypad'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                {settings.language === 'it' ? 'Mostra la tastiera con tasti % veloci' : 'Display tactile keypad with rapid percent modifiers'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onUpdateSettings({ showKeypad: !settings.showKeypad })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showKeypad ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.showKeypad ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {settings.language === 'it' ? 'Salva e Chiudi' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
