import { PoolDimensions, PoolType, SolariumConfig, ArcSide } from "@/types";
import { TILE_SIZE, ARC_WATER_RADIUS, ARC_TOTAL_RADIUS } from "@/lib/constants";

export interface LayoutShape {
    type: 'rect' | 'circle' | 'arc-wedge';
    x: number;
    y: number;
    w?: number;
    h?: number;
    r?: number;
    rotation?: number;
    colorType: 'water' | 'border' | 'tile' | 'water-arc';
}

export interface PoolLayout {
    viewBoxW: number;
    viewBoxH: number;
    shapes: LayoutShape[];
    dimensions: PoolDimensions;
}

export function generatePoolLayout(
    dimensions: PoolDimensions,
    type: PoolType,
    solarium: SolariumConfig,
    hasArc: boolean,
    arcSide: ArcSide
): PoolLayout {
    const shapes: LayoutShape[] = [];
    const poolTilesX = Math.ceil(dimensions.width / TILE_SIZE);
    const poolTilesY = Math.ceil(dimensions.length / TILE_SIZE);
    const borderRing = 1;

    // --- GEOMETRY CONFIG ---
    // Roman Arc fixed geometry: 
    // Diameter = 2.0m. Radius = 1.0m (2 Tiles).
    // Center aligned with WATER EDGE for correct internal dimension.
    // Shift = 0.
    const shift = 0;

    // Radius (1 tile water) + Border (1 tile) = 2 tiles.
    const arcExtensionTiles = 2;
    const arcHeightTiles = hasArc ? arcExtensionTiles : 0;

    const topOffset = solarium.top + borderRing + (hasArc && arcSide === 'top' ? arcHeightTiles : 0);
    const bottomOffset = solarium.bottom + borderRing + (hasArc && arcSide === 'bottom' ? arcHeightTiles : 0);
    const leftOffset = solarium.left + borderRing + (hasArc && arcSide === 'left' ? arcHeightTiles : 0);
    const rightOffset = solarium.right + borderRing + (hasArc && arcSide === 'right' ? arcHeightTiles : 0);

    const totalTilesX = leftOffset + poolTilesX + rightOffset;
    const totalTilesY = topOffset + poolTilesY + bottomOffset;

    const viewBoxW = totalTilesX * TILE_SIZE;
    const viewBoxH = totalTilesY * TILE_SIZE;

    // Pool Origin (Water Top-Left)
    const poolX = leftOffset * TILE_SIZE;
    const poolY = topOffset * TILE_SIZE;
    const poolW = poolTilesX * TILE_SIZE;
    const poolH = poolTilesY * TILE_SIZE;

    // --- ARC CENTER CALCULATION ---
    let arcCX = 0;
    let arcCY = 0;

    if (hasArc) {
        if (arcSide === 'top') {
            arcCX = poolX + poolW / 2;
            arcCY = poolY; // At water edge
        } else if (arcSide === 'bottom') {
            arcCX = poolX + poolW / 2;
            arcCY = poolY + poolH;
        } else if (arcSide === 'left') {
            arcCX = poolX;
            arcCY = poolY + poolH / 2;
        } else if (arcSide === 'right') {
            arcCX = poolX + poolW;
            arcCY = poolY + poolH / 2;
        }
    }

    // 1. Water Body
    shapes.push({
        type: 'rect',
        x: poolX,
        y: poolY,
        w: poolW,
        h: poolH,
        colorType: 'water'
    });

    // 2. Arc Water
    if (hasArc) {
        // Total Radius 1.0m (2 tiles), water radius 0.5m
        const radius = ARC_WATER_RADIUS;

        shapes.push({
            type: 'circle',
            x: arcCX,
            y: arcCY,
            r: radius,
            colorType: 'water-arc'
        });

        // 3. Arc Wedges Overlay (Border)
        let rotation = 0;
        if (arcSide === 'top') rotation = 180;
        if (arcSide === 'bottom') rotation = 0;
        if (arcSide === 'left') rotation = 90;
        if (arcSide === 'right') rotation = -90;

        shapes.push({
            type: 'arc-wedge',
            x: arcCX,
            y: arcCY,
            rotation,
            colorType: 'border'
        });


    }

    // 4. Tiles Grid
    for (let y = 0; y < totalTilesY; y++) {
        for (let x = 0; x < totalTilesX; x++) {
            const drawX = x * TILE_SIZE;
            const drawY = y * TILE_SIZE;

            // Tile Center
            const tileCX = drawX + TILE_SIZE / 2;
            const tileCY = drawY + TILE_SIZE / 2;

            // --- EXCLUSION CHECK (Water & Arc Zone) ---
            // Skip if inside Main Water
            if (drawX >= poolX && drawX < poolX + poolW && drawY >= poolY && drawY < poolY + poolH) continue;

            // Roman Arc Exclusion
            if (hasArc) {
                // Determine if tile is within the Arc's footprint.
                // The Arc consists of:
                // 1. Water Semi-circle (R = 1.0m)
                // 2. Border Ring (R = 1.5m)
                // We must exclude standard grid tiles in this area.
                // We use 1.55m to be safe and cover the edges of the border tiles.
                // However, we must only exclude on the "Deck" side of the pool edge.

                // Distance from arc center
                const dist = Math.sqrt((tileCX - arcCX) ** 2 + (tileCY - arcCY) ** 2);

                // Radius 1.0m (2 tiles total structure). 
                // We use 1.01 to ensure we catch the tiles that strictly overlap the 1m mark.
                if (dist < 1.01) continue;
            }


            // --- STANDARD TILE TYPE ---
            let isBorder = false;

            // Standard Rectangular Border Check
            if (
                (drawX >= poolX - TILE_SIZE && drawX < poolX + poolW + TILE_SIZE) &&
                (drawY >= poolY - TILE_SIZE && drawY < poolY + poolH + TILE_SIZE)
            ) {
                isBorder = true;
            }

            shapes.push({
                type: 'rect',
                x: drawX,
                y: drawY,
                w: TILE_SIZE,
                h: TILE_SIZE,
                colorType: isBorder ? 'border' : 'tile'
            });
        }
    }

    return { viewBoxW, viewBoxH, shapes, dimensions };
}
