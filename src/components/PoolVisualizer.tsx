import { PoolDimensions, PoolType, SolariumConfig, ArcSide } from "@/types";
import { TILE_SIZE, ARC_WATER_RADIUS, ARC_TOTAL_RADIUS } from "@/lib/constants";
import { generatePoolLayout } from "@/lib/poolLayout";

interface PoolVisualizerProps {
    dimensions: PoolDimensions;
    type: PoolType;
    solarium: SolariumConfig;
    hasArc: boolean;
    arcSide: ArcSide;
    color: string;
}

export default function PoolVisualizer({
    dimensions,
    type,
    solarium,
    hasArc,
    arcSide = 'top',
    color,
}: PoolVisualizerProps) {
    // Generate Layout Data using shared logic
    const layout = generatePoolLayout(dimensions, type, solarium, hasArc, arcSide);
    const { viewBoxW, viewBoxH, shapes } = layout;

    // Helper to get color code
    const getColor = (c: string, variant: 'base' | 'dark' = 'base') => {
        const colors: Record<string, { base: string, dark: string }> = {
            'blanco': { base: '#f3f4f6', dark: '#d1d5db' },
            'beige': { base: '#e8dcca', dark: '#d4c5af' },
            'gris claro': { base: '#9ca3af', dark: '#6b7280' },
            'gris oscuro': { base: '#4b5563', dark: '#374151' },
            'otro': { base: '#e8dcca', dark: '#d4c5af' }
        };
        const selected = colors[(c || 'beige').toLowerCase()] || colors['beige'];
        return variant === 'base' ? selected.base : selected.dark;
    };

    const tileColor = getColor(color);
    const borderColor = getColor(color, 'dark');
    const waterColor = '#0ea5e9';

    const renderShapes = () => {
        return shapes.map((shape, idx) => {
            if (shape.type === 'rect') {
                return (
                    <rect
                        key={`rect-${idx}`}
                        x={shape.x + 0.02} // GAP
                        y={shape.y + 0.02}
                        width={shape.w! - 0.04}
                        height={shape.h! - 0.04}
                        fill={shape.colorType === 'water' ? waterColor :
                            shape.colorType === 'border' ? borderColor : tileColor}
                        rx={shape.colorType === 'water' ? (type === 'fiber' ? 0.3 : 0) : 0.05}
                    />
                );
            }
            if (shape.type === 'circle') {
                return (
                    <circle
                        key={`circ-${idx}`}
                        cx={shape.x}
                        cy={shape.y}
                        r={shape.r}
                        fill={waterColor}
                    />
                );
            }
            if (shape.type === 'arc-wedge') {
                // Render the arc as 8 individual segments (2 arranques, 6 cuñas)
                const segments = 8;
                const angleStep = 180 / segments;
                const rIn = ARC_WATER_RADIUS; // 0.5
                const rOut = ARC_TOTAL_RADIUS; // 1.0

                return (
                    <g key={`wedge-${idx}`} transform={`translate(${shape.x}, ${shape.y}) rotate(${shape.rotation})`}>
                        {Array.from({ length: segments }).map((_, i) => {
                            const startAngle = i * angleStep;
                            const endAngle = (i + 1) * angleStep;

                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;

                            const x1 = rIn * Math.cos(startRad);
                            const y1 = rIn * Math.sin(startRad);
                            const x2 = rOut * Math.cos(startRad);
                            const y2 = rOut * Math.sin(startRad);

                            const x3 = rOut * Math.cos(endRad);
                            const y3 = rOut * Math.sin(endRad);
                            const x4 = rIn * Math.cos(endRad);
                            const y4 = rIn * Math.sin(endRad);

                            const pathData = `
                                M ${x1} ${y1}
                                L ${x2} ${y2}
                                A ${rOut} ${rOut} 0 0 1 ${x3} ${y3}
                                L ${x4} ${y4}
                                A ${rIn} ${rIn} 0 0 0 ${x1} ${y1}
                                Z
                            `;

                            return (
                                <path
                                    key={i}
                                    d={pathData}
                                    fill={borderColor}
                                    stroke="white"
                                    strokeWidth="0.02"
                                />
                            );
                        })}
                    </g>
                );
            }
            return null;
        });
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-square md:aspect-video bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-4">
                <svg
                    viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g>
                        {renderShapes()}
                    </g>
                    {/* Measurements */}
                    <g className="text-[0.2px] font-mono fill-slate-500 pointer-events-none select-none">
                        <text x={viewBoxW / 2} y={viewBoxH - 0.2} textAnchor="middle" style={{ fontSize: '0.2px' }}>{dimensions.width}m</text>
                    </g>
                </svg>
            </div>
        </div>
    );
}
