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
        {
            const res = calculateQuote(
                { length: 6, width: 3 },
                'concrete',
                false,
                { top: 0, bottom: 0, left: 0, right: 0 },
                'top',
                DEFAULT_PRICES,
                false,
                0,
                false,
                'existing',
                'ml'
            );

            const bordeL = res.items.find(i => i.id === 'borde_l');
            const baldosa = res.items.find(i => i.id === 'baldosa');
            const expectedPieces = ((6 / 0.5) + (3 / 0.5)) * 2;

            if (bordeL?.quantity === expectedPieces && baldosa?.quantity === 4) {
                log(`Test 1 (Hormigón 6x3): PASS. Borde L: ${bordeL?.quantity}, Baldosas: ${baldosa?.quantity}`, true);
            } else {
                log(`Test 1 (Hormigón 6x3): FAIL. Expected 36/4. Got ${bordeL?.quantity}/${baldosa?.quantity}`, false);
            }
        }

        // Test 2: Fiber Rounding
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
                'existing',
                'ml'
            );

            const dims = res.dimensions;
            const roundedCorrectly = dims.length === 6.0 && dims.width === 3.5;
            const bordeL = res.items.find(i => i.id === 'borde_l')?.quantity || 0;
            const esquinero = res.items.find(i => i.id === 'esquinero')?.quantity || 0;
            const baldosa = res.items.find(i => i.id === 'baldosa')?.quantity || 0;

            if (roundedCorrectly && bordeL === 30 && esquinero === 8 && baldosa === 4) {
                log(`Test 2 (Fibra Redondeo): PASS.`, true);
            } else {
                log(`Test 2: FAIL. Dims: ${dims.length}x${dims.width}. Items: L=${bordeL}, Esq=${esquinero}, Bald=${baldosa}`, false);
            }
        }

        // Test 3: Roman Arc
        {
            const res = calculateQuote(
                { length: 6, width: 3 },
                'concrete',
                true,
                { top: 0, bottom: 0, left: 0, right: 0 },
                'top',
                DEFAULT_PRICES,
                false,
                0,
                false,
                'existing',
                'ml'
            );

            const bordeL = res.items.find(i => i.id === 'borde_l')?.quantity || 0;
            if (bordeL === (36 - 4) && res.items.some(i => i.id === 'arranque')) {
                log(`Test 3 (Arco Romano): PASS.`, true);
            } else {
                log(`Test 3: FAIL. BordeL=${bordeL}`, false);
            }
        }

        // Test 4: Solarium
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
                'existing',
                'ml'
            );

            const baldosa = res.items.find(i => i.id === 'baldosa')?.quantity || 0;
            if (baldosa === 23) {
                log(`Test 4 (Solarium L-Shape): PASS.`, true);
            } else {
                log(`Test 4: FAIL. Got ${baldosa}`, false);
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
