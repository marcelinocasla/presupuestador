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
    arcSide: ArcSide, // New param
    prices: PriceList,
    includePastina: boolean,
    pastinaQuantity: number,
    includeInstallation: boolean,
    installationType: InstallationType
): { items: QuoteItem[]; dimensions: PoolDimensions; installation?: InstallationResult } {
    // 1. Normalize dimensions
    const dims = { ...rawDimensions };
    if (type === 'fiber') {
        dims.length = roundToStep(dims.length);
        dims.width = roundToStep(dims.width);
    }

    const items: QuoteItem[] = [];

    // Helper to add/update items
    const addItem = (id: string, name: keyof PriceList | string, quantity: number, priceOverride?: number) => {
        if (quantity <= 0) return;

        // Find price key matching the ID if possible, roughly
        let priceKey: keyof PriceList | undefined;
        // Map common IDs to PriceList keys
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
            name: typeof name === 'string' ? name : id, // Ideally clean up naming
            quantity,
            unitPrice,
            subtotal: quantity * unitPrice,
            unit: 'un'
        });
    };

    // 2. Base Perimeter Calculation
    // All pools calculated as rectangular first (per prompt rules for Fibra too)
    const lengthCount = Math.ceil(dims.length / TILE_SIZE);
    const widthCount = Math.ceil(dims.width / TILE_SIZE);
    const totalPerimeterPieces = (lengthCount + widthCount) * 2;

    let ordeLCheck = totalPerimeterPieces;
    let esquineroCount = 0;
    let baldosaCount = 0;
    let arranqueCount = 0;
    let cunaCount = 0;

    // 3. Apply Specific Rules
    if (type === 'concrete') {
        // Case A: Hormigón
        // "El total del perimetro corresponde enteramente a Bordes L"
        // "y 4 Baldosas 50x50 para las esquinas"
        ordeLCheck = totalPerimeterPieces;
        baldosaCount += 4;
    } else {
        // Case B: Fibra (Redondeada)
        // "Calcular perímetro total... como si fuera rectangular con Bordes L" -> done (totalPerimeterPieces)
        // "Restar 8 unidades de Borde L"
        ordeLCheck -= 8;
        // "Sumar 8 unidades de Esquinero"
        esquineroCount += 8;
        // "Sumar 4 unidades de Baldosa"
        baldosaCount += 4;
    }

    // 4. Arc Option
    if (hasArc) {
        // Adjust for Roman Arc (Standard 2m diameter = 4 tiles)
        // Visually covers 4 straight tiles width.

        ordeLCheck -= 4; // Remove 4 straight borders (Corrected variable name)

        // Add Arc Pieces via counts (handled at end of function)
        arranqueCount += 2;
        cunaCount += 6;

        // NEW: Add implicit solarium tiles (baldosas) for the Arc Extension.
        // The visualizer extends the grid by 2 rows/cols to accommodate the arc.
        // We must account for the tiles in this expansion, minus the ones displaced by the arc itself.

        let sideLengthTiles = 0;
        if (arcSide === 'top' || arcSide === 'bottom') {
            // Side is Width (X). Total width in tiles = PoolWidth + Borders(2) + Solarium Sides
            sideLengthTiles = widthCount + 2 + solarium.left + solarium.right;
        } else {
            // Side is Length (Y). Total length in tiles = PoolLength + Borders(2) + Solarium Top/Bottom
            sideLengthTiles = lengthCount + 2 + solarium.top + solarium.bottom;
        }

        // Area added = SideLength * 2 rows.
        // Tiles blocked by Arc = 4 (in Border row, handled by ordeLCheck-=4) + 2 (in first Extension row).
        // The Border row tiles are already "removed" from Borde L count above.
        // We are adding "Baldosas" for the 2 extension rows.
        // Total Extension Tiles = (SideLength * 2).
        // Minus the 2 tiles blocked in the first extension row.
        const implicitBaldosas = (sideLengthTiles * 2) - 2;

        baldosaCount += Math.max(0, implicitBaldosas);
    }

    // 5. Solarium Expansion
    // Logic: Calculate Total Area of (Pool + Border + Solarium) - Area of (Pool + Border)
    // This automatically handles strips, corner extensions, and corner intersections.

    // Base Pool+Border Dimensions (in tiles)
    // Border adds 1 tile on each side (Left/Right add to Width, Top/Bottom add to Length)
    // Wait, let's stick to X/Y.
    // Width (X) includes Left Border + Water Width + Right Border.
    const baseWidthTiles = widthCount + 2;
    const baseLengthTiles = lengthCount + 2;

    // Full Solarium Dimensions
    // Solarium Top/Bottom add to Length (Y).
    // Solarium Left/Right add to Width (X).
    const fullWidthTiles = baseWidthTiles + solarium.left + solarium.right;
    const fullLengthTiles = baseLengthTiles + solarium.top + solarium.bottom;

    const solariumTilesCount = (fullWidthTiles * fullLengthTiles) - (baseWidthTiles * baseLengthTiles);

    baldosaCount += solariumTilesCount;

    // Add all to items
    addItem('borde_l', 'Borde L (50x50)', ordeLCheck);
    addItem('esquinero', 'Esquinero', esquineroCount);
    addItem('baldosa', 'Baldosa (50x50)', baldosaCount);
    addItem('arranque', 'Arranque Arco Romano', arranqueCount);
    addItem('cuna', 'Cuña Arco Romano', cunaCount);

    // Pastina Logic: Manual Input
    if (includePastina) {
        addItem('pastina', 'Pastina (x Kg)', pastinaQuantity || 0);
    }

    // 6. Installation Logic
    let installation: InstallationResult | undefined;
    if (includeInstallation) {
        // Metros Lineales: Base Pool + Borders
        // Standard perimeter = (Length + Border * 2) + (Width + Border * 2) * 2? 
        // No, it's simpler: the borders are 50x50. 
        // The total number of border pieces (straight + corners/arc) * 0.5m gives the perimeter.
        const totalPieces = ordeLCheck + esquineroCount + arranqueCount + cunaCount;
        const metrosLineales = totalPieces * TILE_SIZE;
        const totalArea = (fullWidthTiles * fullLengthTiles) * (TILE_SIZE * TILE_SIZE);

        installation = calculateInstallation(metrosLineales, totalArea, installationType);
    }

    return { items, dimensions: dims, installation };
}

function calculateInstallation(metrosLineales: number, totalArea: number, type: InstallationType): InstallationResult {
    const PRECIO_LINEAL_SIN_HORMIGON = 15000;
    const PRECIO_M2_CON_HORMIGON = 30000;
    const ANCHO_BALDOSA = 0.5;

    let result: InstallationResult = {
        laborCost: 0,
        materials: { items: [] },
        description: ""
    };

    if (type === 'existing') {
        result.description = "Colocación sobre carpeta existente + Pilotines";
        result.laborCost = metrosLineales * PRECIO_LINEAL_SIN_HORMIGON;

        const cantidadPilotines = Math.ceil(metrosLineales / 3);
        const varillasHierro = Math.ceil(cantidadPilotines / 5);
        const superficie = metrosLineales * ANCHO_BALDOSA;

        result.materials.items = [
            { name: "Cemento", quantity: Math.ceil(superficie * 0.5), unit: "bolsas" },
            { name: "Cal", quantity: Math.ceil(superficie * 0.7), unit: "bolsas" },
            { name: "Arena", quantity: (superficie * 0.06).toFixed(1), unit: "m³" },
            { name: "Varillas del 6", quantity: varillasHierro, unit: "un" },
            { name: "Nota para el albañil", quantity: cantidadPilotines, unit: "pilotines a realizar" }
        ];
    } else {
        result.description = "Hormigonado completo + Colocación";
        result.laborCost = totalArea * PRECIO_M2_CON_HORMIGON;

        result.materials.items = [
            { name: "Cemento", quantity: Math.ceil(totalArea * 1), unit: "bolsas" },
            { name: "Arena", quantity: (totalArea * 0.1).toFixed(2), unit: "m³" },
            { name: "Piedra", quantity: (totalArea * 0.1).toFixed(2), unit: "m³" },
            { name: "Malla Sima 4.2 (5x2)", quantity: Math.ceil(totalArea / 10), unit: "un" }
        ];
    }

    return result;
}
