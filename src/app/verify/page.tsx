'use client';

import { calculateQuote } from '@/lib/calculator';
import { DEFAULT_PRICES } from '@/lib/constants';
import { PoolDimensions, PoolType, SolariumConfig } from '@/types';
import { useEffect, useState, useCallback } from 'react';

export default function VerificationPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [passed, setPassed] = useState(0);
    const [failed, setFailed] = useState(0);

    const log = useCallback((msg: string, success?: boolean) => {
        setLogs(prev => [...prev, `${success === true ? '✅' : success === false ? '❌' : 'ℹ️'} ${msg}`]);
        if (success === true) setPassed(p => p + 1);
        if (success === false) setFailed(f => f + 1);
    }, []);

    const runTests = useCallback(() => {
        log('Iniciando Pruebas de Lógica de Negocio...');

        // Test 1: Concrete Rectangular 6x3
        // Perim: 6+6+3+3 = 18m. / 0.5 = 36 pieces.
        // Case A: All 36 are Borde L. + 4 Baldosas extras for corners.
        {
            const res = calculateQuote(
                { length: 6, width: 3 },
                'concrete',
                false,
                { top: 0, bottom: 0, left: 0, right: 0 },
                'top', // ArcSide default
                DEFAULT_PRICES,
                false, // Include Pastina
                0, // Pastina Qty
                false, // includeInstallation
                'existing' // installationType
            );

            const bordeL = res.items.find(i => i.id === 'borde_l');
            const baldosa = res.items.find(i => i.id === 'baldosa');

            const expectedPieces = ((6 / 0.5) + (3 / 0.5)) * 2; // 12 + 6 = 18. * 2 = 36.

            if (bordeL?.quantity === expectedPieces && baldosa?.quantity === 4) {
                log(`Test 1 (Hormigón 6x3): PASS. Borde L: ${bordeL?.quantity}, Baldosas: ${baldosa?.quantity}`, true);
            } else {
                log(`Test 1 (Hormigón 6x3): FAIL. Expected 36/4. Got ${bordeL?.quantity}/${baldosa?.quantity}`, false);
            }
        }

        // Test 2: Fiber Rounding & Replacement
        // Input: 5.9 x 3.4
        // Should round to: 6.0 x 3.5
        // Perim pieces: (12 + 7) * 2 = 38.
        // Case B:
        // -8 Borde L -> 30
        // +8 Esquinero -> 8
        // +4 Baldosas -> 4
        {
            const res = calculateQuote(
                { length: 5.9, width: 3.4 },
                'fiber',
                false,
                { top: 0, bottom: 0, left: 0, right: 0 },
                'top',
                DEFAULT_PRICES,
                false,
                0,
                false,
                'existing'
            );

            const dims = res.dimensions;
            const roundedCorrectly = dims.length === 6.0 && dims.width === 3.5;

            const bordeL = res.items.find(i => i.id === 'borde_l')?.quantity || 0;
            const esquinero = res.items.find(i => i.id === 'esquinero')?.quantity || 0;
            const baldosa = res.items.find(i => i.id === 'baldosa')?.quantity || 0;

            const expectedBordeL = 38 - 8; // 30
            const expectedEsquinero = 8;
            const expectedBaldosa = 4;

            if (roundedCorrectly && bordeL === expectedBordeL && esquinero === expectedEsquinero && baldosa === expectedBaldosa) {
                log(`Test 2 (Fibra Redondeo 5.9x3.4 -> 6x3.5): PASS.`, true);
            } else {
                log(`Test 2: FAIL. Dims: ${dims.length}x${dims.width}. Items: L=${bordeL}(Exp 30), Esq=${esquinero}(Exp 8), Bald=${baldosa}(Exp 4)`, false);
            }
        }

        // Test 3: Roman Arc
        // Concrete 6x3 with Arc.
        // Base Borde L: 36.
        // Arc Logic: -4 Borde L, +2 Arranque, +6 Cuña.
        {
            const res = calculateQuote(
                { length: 6, width: 3 },
                'concrete',
                true, // hasArc
                { top: 0, bottom: 0, left: 0, right: 0 },
                'top',
                DEFAULT_PRICES,
                false,
                0,
                false,
                'existing'
            );

            const bordeL = res.items.find(i => i.id === 'borde_l')?.quantity || 0;
            const arranque = res.items.find(i => i.id === 'arranque')?.quantity || 0;
            const cuna = res.items.find(i => i.id === 'cuna')?.quantity || 0;

            const expectedBordeL = 36 - 4; // 32

            if (bordeL === expectedBordeL && arranque === 2 && cuna === 6) {
                log(`Test 3 (Arco Romano): PASS.`, true);
            } else {
                log(`Test 3: FAIL. L=${bordeL}, Arr=${arranque}, Cun=${cuna}`, false);
            }
        }

        // Test 4: Solarium Logic
        {
            const res = calculateQuote(
                { length: 6, width: 3 },
                'concrete',
                false,
                { top: 1, bottom: 0, left: 0, right: 1 },
                'top',
                DEFAULT_PRICES,
                false,
                0,
                false,
                'existing'
            );

            const baldosa = res.items.find(i => i.id === 'baldosa')?.quantity || 0;

            if (baldosa === 23) {
                log(`Test 4 (Solarium L-Shape): PASS. Baldosas=${baldosa}`, true);
            } else {
                log(`Test 4: FAIL. Expected 23 Baldosas. Got ${baldosa}`, false);
            }
        }
    }, [log]);

    useEffect(() => {
        runTests();
    }, [runTests]);

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Verificación de Lógica</h1>
            <div className={`text-lg mb-4 font-bold ${failed === 0 ? 'text-green-600' : 'text-red-600'}`}>
                Resultados: {passed} Aprobados, {failed} Fallidos
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                {logs.map((L, i) => (
                    <div key={i} className={L.includes('❌') ? 'text-red-500' : L.includes('✅') ? 'text-green-600' : 'text-gray-500'}>
                        {L}
                    </div>
                ))}
            </div>
        </div>
    );
}
