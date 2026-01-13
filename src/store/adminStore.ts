import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PriceList, CompanyInfo, HistoryEntry } from '@/types';
import { DEFAULT_PRICES, DEFAULT_COMPANY_INFO } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

interface AdminState {
    prices: PriceList;
    companyInfo: CompanyInfo;
    history: HistoryEntry[];
    isLoading: boolean;
    updatePrices: (prices: Partial<PriceList>) => void;
    updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
    addQuoteToHistory: (quote: HistoryEntry) => void;
    removeQuoteFromHistory: (id: string) => void;
    setLoading: (loading: boolean) => void;
    fetchData: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            isLoading: false,
            prices: DEFAULT_PRICES,
            companyInfo: DEFAULT_COMPANY_INFO,
            history: [],
            setLoading: (loading) => set({ isLoading: loading }),
            updatePrices: (newPrices) =>
                set((state) => {
                    const prices = { ...state.prices, ...newPrices };
                    supabase.from('settings').upsert({ id: 1, prices }).then();
                    return { prices };
                }),
            updateCompanyInfo: (newInfo) =>
                set((state) => {
                    const companyInfo = { ...state.companyInfo, ...newInfo };
                    supabase.from('settings').upsert({ id: 1, company_info: companyInfo }).then();
                    return { companyInfo };
                }),
            addQuoteToHistory: (quote) =>
                set((state) => {
                    const newHistory = [quote, ...state.history];
                    supabase.from('quotes').insert([{
                        id: quote.id,
                        client_name: quote.clientName,
                        total: quote.total,
                        config: quote.config,
                        items: quote.items,
                        status: quote.status
                    }]).then();
                    return { history: newHistory };
                }),
            removeQuoteFromHistory: (id) =>
                set((state) => {
                    const newHistory = state.history.filter(h => h.id !== id);
                    supabase.from('quotes').delete().eq('id', id).then();
                    return { history: newHistory };
                }),
            fetchData: async () => {
                set({ isLoading: true });
                try {
                    const { data: quotes } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
                    const { data: settings } = await supabase.from('settings').select('*').single();

                    if (quotes) {
                        const history: HistoryEntry[] = quotes.map(q => ({
                            id: q.id,
                            clientName: q.client_name,
                            total: q.total,
                            items: q.items,
                            status: q.status,
                            date: q.created_at,
                            config: q.config
                        }));
                        set({ history });
                    }

                    if (settings) {
                        set({
                            prices: settings.prices || DEFAULT_PRICES,
                            companyInfo: settings.company_info || DEFAULT_COMPANY_INFO
                        });
                    }
                } catch (error) {
                    console.warn('Error fetching data:', error);
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'atermicos-admin-storage',
        }
    )
);
