export type PoolType = 'concrete' | 'fiber';

export type SolariumConfig = {
  top: number; // Number of rows
  bottom: number;
  left: number;
  right: number;
};

export type PoolDimensions = {
  length: number;
  width: number;
};

export type ProductDetails = {
  price: number;
  stock: number;
  colors?: string[];
  inStock: boolean;
};

export type PriceList = {
  baldosa: ProductDetails;
  bordeL: ProductDetails;
  esquinero: ProductDetails;
  arranqueArco: ProductDetails;
  cunaArco: ProductDetails;
  deck: ProductDetails;
  deckL: ProductDetails;
  pastina: ProductDetails;
  pallet: ProductDetails;
};

export type CompanyInfo = {
  logoUrl: string;
  address: string;
  phone: string;
  name: string; // "ATÉRMICOS CELINA" default
};

export type QuoteItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit: string; // 'un', 'm2', 'kg'
};

export type InstallationType = 'existing' | 'new_slab';

export type MaterialItem = {
  name: string;
  quantity: number | string;
  unit: string;
};

export type MaterialList = {
  items: MaterialItem[];
  notes?: string;
};

export type InstallationResult = {
  laborCost: number;
  materials: MaterialList;
  description: string;
};

export type QuoteResult = {
  items: QuoteItem[];
  subtotalMaterial: number;
  palletCount: number;
  palletCost: number;
  shippingCost: number;
  installation?: InstallationResult;
  total: number;
};

export type ArcSide = 'top' | 'bottom' | 'left' | 'right';

export type HistoryEntry = {
  id: string;
  clientName: string;
  date: string;
  items: QuoteItem[];
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  config: {
    dimensions: PoolDimensions;
    poolType: PoolType;
    solarium: SolariumConfig;
    hasArc: boolean;
    arcSide: ArcSide;
    selectedColor: string;
    shippingCost: number;
    includePallet: boolean;
    includePastina: boolean;
    pastinaQuantity: number;
    includeInstallation: boolean;
    installationType: InstallationType;
  };
};
