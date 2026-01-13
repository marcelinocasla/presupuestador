import { PriceList, CompanyInfo } from '@/types';

export const DEFAULT_PRICES: PriceList = {
    baldosa: { price: 5500, stock: 100, inStock: true, colors: ['Beige', 'Blanco', 'Gris'] },
    bordeL: { price: 6000, stock: 50, inStock: true, colors: ['Beige', 'Blanco', 'Gris'] },
    esquinero: { price: 6500, stock: 20, inStock: true, colors: ['Beige', 'Blanco', 'Gris'] },
    arranqueArco: { price: 6500, stock: 10, inStock: true, colors: ['Beige', 'Blanco', 'Gris'] },
    cunaArco: { price: 6500, stock: 30, inStock: true, colors: ['Beige', 'Blanco', 'Gris'] },
    deck: { price: 5500, stock: 200, inStock: true, colors: ['Madera', 'Gris'] },
    deckL: { price: 6000, stock: 40, inStock: true, colors: ['Madera', 'Gris'] },
    pastina: { price: 3000, stock: 500, inStock: true },
    pallet: { price: 0, stock: 1000, inStock: true },
    installationScenarioA: { price: 18000, stock: 0, inStock: true },
    installationScenarioB: { price: 30000, stock: 0, inStock: true },
};

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
    name: 'ATÉRMICOS CELINA',
    address: 'Calle 101 N° 1234, Jose C. Paz',
    phone: '+54 11 1234-5678',
    logoUrl: '/logo.png',
};

export const TILE_SIZE = 0.50;
export const DECK_WIDTH = 0.12;
export const DECK_LENGTH = 1.00;
export const PALLET_CAPACITY = 100;
export const ARC_TOTAL_DIAMETER = 2.0;
export const ARC_WATER_RADIUS = 0.5;
export const ARC_TOTAL_RADIUS = 1.0;
export const ARC_TILES_COUNT = ARC_TOTAL_DIAMETER / TILE_SIZE;
