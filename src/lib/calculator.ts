import { PoolDimensions, PoolType, SolariumConfig, QuoteItem, PriceList, ArcSide, QuoteResult, InstallationType, InstallationResult } from "@/types";
import { TILE_SIZE } from "./constants";

const ROUNDING_STEP = 0.5;

function roundToStep(value: number): number {
    return Math.ceil(value / ROUNDING_STEP) * ROUNDING_STEP;
}

export function calculateQuote(
    rawDimensions: PoolDimensions,
    type: PoolType,
    hasArc: boolean,
    solarium: SolariumConfig,
    arcSide: ArcSide,
    prices: PriceList,
    includePastina: boolean,
    pastinaQuantity: number,
    includeInstallation: boolean,
    installationType: InstallationType,
    installationUnit: 'ml' | 'm2'
): { items: QuoteItem[]; dimensions: PoolDimensions; installation?: InstallationResult } {
    const dims = { ...rawDimensions };
    if (type === 'fiber') {
        dims.length = roundToStep(dims.length);
        dims.width = roundToStep(dims.width);
    }

    const items: QuoteItem[] = [];

    const addItem = (id: string, name: keyof PriceList | string, quantity: number, priceOverride?: number) => {
        if (quantity <= 0) return;

        let priceKey: keyof PriceList | undefined;
        if (id === 'borde_l') priceKey = 'bordeL';
        if (id === 'baldosa') priceKey = 'baldosa';
        if (id === 'esquinero') priceKey = 'esquinero';
        if (id === 'arranque') priceKey = 'arranqueArco';
        if (id === 'cuna') priceKey = 'cunaArco';
        if (id === 'deck') priceKey = 'deck';
        if (id === 'deck_l') priceKey = 'deckL';
        if (id === 'pastina') priceKey = 'pastina';

        const unitPrice = priceOverride ?? (priceKey ? prices[priceKey].price : 0);

        items.push({
            id,
            name: typeof name === 'string' ? name : id,
            quantity,
            unitPrice,
            subtotal: quantity * unitPrice,
            unit: 'un'
        });
    };

    const lengthCount = Math.ceil(dims.length / TILE_SIZE);
    const widthCount = Math.ceil(dims.width / TILE_SIZE);
    const totalPerimeterPieces = (lengthCount + widthCount) * 2;

    let ordeLCheck = totalPerimeterPieces;
    let esquineroCount = 0;
    let baldosaCount = 0;
    let arranqueCount = 0;
    let cunaCount = 0;

    if (type === 'concrete') {
        ordeLCheck = totalPerimeterPieces;
        baldosaCount += 4;
    } else {
        ordeLCheck -= 8;
        esquineroCount += 8;
        baldosaCount += 4;
    }

    if (hasArc) {
        ordeLCheck -= 4;
        arranqueCount += 2;
        cunaCount += 6;

        let sideLengthTiles = 0;
        if (arcSide === 'top' || arcSide === 'bottom') {
            sideLengthTiles = widthCount + 2 + solarium.left + solarium.right;
        } else {
            sideLengthTiles = lengthCount + 2 + solarium.top + solarium.bottom;
        }

        const implicitBaldosas = (sideLengthTiles * 2) - 2;
        baldosaCount += Math.max(0, implicitBaldosas);
    }

    const baseWidthTiles = widthCount + 2;
    const baseLengthTiles = lengthCount + 2;
    const fullWidthTiles = baseWidthTiles + solarium.left + solarium.right;
    const fullLengthTiles = baseLengthTiles + solarium.top + solarium.bottom;

    const solariumTilesCount = (fullWidthTiles * fullLengthTiles) - (baseWidthTiles * baseLengthTiles);
    baldosaCount += solariumTilesCount;

    addItem('borde_l', 'Borde L (50x50)', ordeLCheck);
    addItem('esquinero', 'Esquinero', esquineroCount);
    addItem('baldosa', 'Baldosa (50x50)', baldosaCount);
    addItem('arranque', 'Arranque Arco Romano', arranqueCount);
    addItem('cuna', 'Cuña Arco Romano', cunaCount);

    if (includePastina) {
        addItem('pastina', 'Pastina (x Kg)', pastinaQuantity || 0);
    }

    let installation: InstallationResult | undefined;
    if (includeInstallation) {
        const totalPerimeterPieces = ordeLCheck + esquineroCount + arranqueCount + cunaCount;
        const totalPiecesWithTiles = totalPerimeterPieces + baldosaCount;
        const metrosLineales = totalPerimeterPieces * TILE_SIZE;
        // Use exact piece count for area to avoid including pool water in material calc
        const totalMaterialArea = totalPiecesWithTiles * (TILE_SIZE * TILE_SIZE);

        installation = calculateInstallation(metrosLineales, totalMaterialArea, installationType, installationUnit, prices);
    }

    return { items, dimensions: dims, installation };
}

function calculateInstallation(
    metrosLineales: number,
    totalMaterialArea: number,
    type: InstallationType,
    unit: 'ml' | 'm2',
    prices: PriceList
): InstallationResult {
    const PRECIO_A = prices.installationScenarioA?.price ?? 18000;
    const PRECIO_B = prices.installationScenarioB?.price ?? 30000;
    const ANCHO_BALDOSA = 0.5;

    let result: InstallationResult = {
        laborCost: 0,
        materials: { items: [] },
        description: ""
    };

    if (type === 'existing') {
        result.description = "Colocación sobre carpeta existente + Pilotines";
        result.laborCost = metrosLineales * PRECIO_A;

        const cantidadPilotines = Math.ceil(metrosLineales / 3);
        const varillasHierro = Math.ceil(cantidadPilotines / 5);
        const superficie = metrosLineales * ANCHO_BALDOSA;

        result.materials.items = [
            { name: "Cemento (50kg)", quantity: Math.ceil(superficie * 0.5), unit: "bolsas" },
            { name: "Cal (25kg)", quantity: Math.ceil(superficie * 0.7), unit: "bolsas" },
            { name: "Arena", quantity: (superficie * 0.06).toFixed(1), unit: "m³" },
            { name: "Varillas del 6", quantity: varillasHierro, unit: "un" },
            { name: "Nota para el albañil", quantity: cantidadPilotines, unit: "pilotines a realizar" }
        ];
    } else {
        result.description = `Hormigonado completo + Colocación (Cobro por ${unit === 'ml' ? 'ML' : 'M2'})`;
        if (unit === 'ml') {
            result.laborCost = metrosLineales * PRECIO_B;
        } else {
            result.laborCost = totalMaterialArea * PRECIO_B;
        }

        const varillasPerimetro = Math.ceil((metrosLineales * 2) / 12); // 2 varillas por todo el perímetro, barras de 12m

        result.materials.items = [
            { name: "Cemento (50kg)", quantity: Math.ceil(totalMaterialArea * 1), unit: "bolsas" },
            { name: "Arena", quantity: (totalMaterialArea * 0.1).toFixed(2), unit: "m³" },
            { name: "Piedra", quantity: (totalMaterialArea * 0.1).toFixed(2), unit: "m³" },
            { name: "Malla Sima 4.2 (5x2)", quantity: Math.ceil(totalMaterialArea / 10), unit: "un" },
            { name: "Varillas del 6", quantity: Math.max(1, varillasPerimetro), unit: "un" }
        ];
    }

    return result;
}
