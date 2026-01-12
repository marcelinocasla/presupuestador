import { create } from 'zustand';
import { PoolDimensions, PoolType, SolariumConfig, QuoteResult, HistoryEntry } from '@/types';

interface QuoteState {
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    transportName: string;
    includePallet: boolean;
    shippingCost: number;
    includePastina: boolean;

    pastinaQuantity: number;

    poolType: PoolType;
    dimensions: PoolDimensions;
    hasArc: boolean;
    arcSide: 'top' | 'bottom' | 'left' | 'right';
    solarium: SolariumConfig;
    selectedColor: string;
    includeInstallation: boolean;
    installationType: 'existing' | 'new_slab';

    // Actions
    setClientInfo: (info: Partial<Pick<QuoteState, 'clientName' | 'clientPhone' | 'clientAddress' | 'transportName' | 'includePallet' | 'shippingCost' | 'includePastina' | 'pastinaQuantity'>>) => void;
    setPoolConfig: (config: Partial<Pick<QuoteState, 'poolType' | 'dimensions' | 'hasArc' | 'arcSide' | 'selectedColor'>>) => void;
    setSolarium: (config: Partial<SolariumConfig>) => void;
    setInstallationConfig: (config: Partial<Pick<QuoteState, 'includeInstallation' | 'installationType'>>) => void;

    currentQuote: QuoteResult | null;
    setQuoteResult: (result: QuoteResult) => void;
    reset: () => void;
    loadFullQuote: (config: HistoryEntry['config'], clientData: { name: string, phone: string, address: string, transport: string }) => void;
}

export const useQuoteStore = create<QuoteState>((set) => ({
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    transportName: '',
    includePallet: false,
    shippingCost: 0,
    includePastina: true, // Default to true or false? Let's say false initially or user choice. User didn't specify default. Let's go with false.
    pastinaQuantity: 1,


    poolType: 'concrete',
    dimensions: { length: 0, width: 0 },
    hasArc: false,
    arcSide: 'top',
    solarium: { top: 0, bottom: 0, left: 0, right: 0 },
    selectedColor: 'Beige',
    includeInstallation: false,
    installationType: 'existing',

    currentQuote: null,

    setClientInfo: (info) => set((state) => ({ ...state, ...info })),
    setPoolConfig: (config) => set((state) => ({ ...state, ...config })),
    setSolarium: (newConfig) => set((state) => ({ solarium: { ...state.solarium, ...newConfig } })),
    setInstallationConfig: (config) => set((state) => ({ ...state, ...config })),
    setQuoteResult: (result) => set({ currentQuote: result }),

    reset: () => set({
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        transportName: '',
        includePallet: false,
        shippingCost: 0,
        includePastina: false,
        pastinaQuantity: 1,
        poolType: 'concrete',
        dimensions: { length: 0, width: 0 },
        hasArc: false,
        arcSide: 'top',
        solarium: { top: 0, bottom: 0, left: 0, right: 0 },
        selectedColor: 'Beige',
        includeInstallation: false,
        installationType: 'existing',
        currentQuote: null,
    }),

    loadFullQuote: (config, clientData) => set({
        ...config,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientAddress: clientData.address,
        transportName: clientData.transport,
    }),
}));
