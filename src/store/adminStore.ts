import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PriceList, CompanyInfo, HistoryEntry } from '@/types';
import { DEFAULT_PRICES, DEFAULT_COMPANY_INFO } from '@/lib/constants';

interface AdminState {
    prices: PriceList;
    companyInfo: CompanyInfo;
    history: HistoryEntry[];
    updatePrices: (prices: Partial<PriceList>) => void;
    updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
    addQuoteToHistory: (quote: HistoryEntry) => void;
    removeQuoteFromHistory: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            prices: DEFAULT_PRICES,
            companyInfo: DEFAULT_COMPANY_INFO,
            history: [],
            updatePrices: (newPrices) =>
                set((state) => ({
                    prices: { ...state.prices, ...newPrices },
                })),
            updateCompanyInfo: (newInfo) =>
                set((state) => ({
                    companyInfo: { ...state.companyInfo, ...newInfo },
                })),
            addQuoteToHistory: (quote) =>
                set((state) => ({
                    history: [quote, ...state.history],
                })),
            removeQuoteFromHistory: (id) =>
                set((state) => ({
                    history: state.history.filter(h => h.id !== id),
                })),
        }),
        {
            name: 'atermicos-admin-storage',
        }
    )
);
