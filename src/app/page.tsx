'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Settings, Download, Calculator, User, Layers, Palette, Truck, CheckCircle2, Circle, Minus, Plus } from 'lucide-react';
import { useQuoteStore } from '@/store/quoteStore';
import { useAdminStore } from '@/store/adminStore';
import { calculateQuote } from '@/lib/calculator';
import PoolVisualizer from '@/components/PoolVisualizer';
import { generatePDF } from '@/lib/pdfGenerator';
import { QuoteSchema } from '@/lib/validation';

export default function QuotePage() {
  const {
    clientName, clientPhone, clientAddress, transportName, includePallet, shippingCost, includePastina, pastinaQuantity,
    poolType, dimensions, hasArc, arcSide, solarium, selectedColor,
    includeInstallation, installationType,
    setClientInfo, setPoolConfig, setSolarium, setInstallationConfig, setQuoteResult, currentQuote
  } = useQuoteStore();

  const { prices, companyInfo, addQuoteToHistory } = useAdminStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Recalculate Logic
  useEffect(() => {
    if (!isClient) return;

    try {
      const result = calculateQuote(
        dimensions,
        poolType,
        hasArc,
        solarium,
        arcSide,
        prices,
        includePastina,
        pastinaQuantity,
        includeInstallation,
        installationType
      );

      // Pallet Calculation (1 pallet approx 100 items - heuristic)
      const totalItems = result.items.reduce((acc, item) => acc + item.quantity, 0);
      const palletCount = Math.ceil(totalItems / 100);
      const palletPrice = prices?.pallet?.price ?? 0;
      const totalPalletCost = includePallet ? (palletCount * palletPrice) : 0;
      const subMaterial = result.items.reduce((acc, item) => acc + Number(item.subtotal), 0);
      const palletCostVal = includePallet ? (palletCount * (Number(prices?.pallet?.price) || 0)) : 0;
      const shipCostVal = Number(shippingCost || 0);
      const instCostVal = includeInstallation ? (Number(result.installation?.laborCost) || 0) : 0;

      const finalTotal = subMaterial + palletCostVal + shipCostVal + instCostVal;

      setQuoteResult({
        ...result,
        subtotalMaterial: subMaterial,
        palletCount,
        palletCost: palletCostVal,
        shippingCost: shipCostVal,
        total: finalTotal
      });
    } catch (err) {
      console.error("Calculation Error", err);
    }

  }, [isClient, dimensions, poolType, hasArc, solarium, prices, includePallet, shippingCost, includePastina, pastinaQuantity, includeInstallation, installationType, setQuoteResult]);

  // PDF Generation
  const visualizerRef = useRef<HTMLDivElement>(null);
  const [includePDFImage, setIncludePDFImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!currentQuote) return;

    // Validation
    const validation = QuoteSchema.safeParse({
      clientName, clientPhone, clientAddress, transportName,
      dimensions, solarium, shippingCost
    });

    if (!validation.success) {
      alert(`Error de validación: ${validation.error.issues[0].message}`);
      return;
    }

    setIsGenerating(true);

    // Create history entry
    addQuoteToHistory({
      id: crypto.randomUUID(),
      clientName: clientName || 'Cliente Sin Nombre',
      date: new Date().toISOString(),
      items: currentQuote.items,
      total: currentQuote.total,
      status: 'approved',
      config: {
        dimensions,
        poolType,
        solarium,
        hasArc,
        arcSide,
        selectedColor,
        shippingCost,
        includePallet,
        includePastina,
        pastinaQuantity,
        includeInstallation,
        installationType
      }
    });

    try {
      await generatePDF({
        quote: currentQuote,
        companyInfo,
        clientInfo: { name: clientName, phone: clientPhone, address: clientAddress, transport: transportName },
        // visualizerRef is no longer needed for vector PDF but kept for interface compat if needed
        visualizerRef: null,
        includeImage: includePDFImage,
        // New Vector Props
        poolType,
        poolDimensions: dimensions,
        solarium,
        hasArc,
        arcSide,
        color: selectedColor
      });
    } catch (error) {
      console.error("PDF Error", error);
      alert("Hubo un error al generar el PDF.");
    }
    setIsGenerating(false);
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4s]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5s]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 pl-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-lg">
              AC
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ATÉRMICOS CELINA</h1>
              <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Sistema de Presupuestos v7.0</p>
            </div>
          </div>
          <Link href="/admin" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </header>


        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Left Panel: Configuration */}
          <div className="xl:col-span-7 space-y-6">

            {/* Client Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                <User className="w-4 h-4" /> Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre" value={clientName} onChange={(v) => setClientInfo({ clientName: v })} placeholder="Ej: Juan Pérez" />
                <Input label="Teléfono" value={clientPhone} onChange={(v) => setClientInfo({ clientPhone: v })} placeholder="+54 9 11..." />
                <Input label="Dirección" value={clientAddress} onChange={(v) => setClientInfo({ clientAddress: v })} className="md:col-span-2" placeholder="Calle 123, Ciudad" />
              </div>
            </div>

            {/* Pool Config Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                <Layers className="w-4 h-4" /> Configuración de Piscina
              </h2>

              <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <TypeButton active={poolType === 'concrete'} onClick={() => setPoolConfig({ poolType: 'concrete' })}>
                  Hormigón (Rectangular)
                </TypeButton>
                <TypeButton active={poolType === 'fiber'} onClick={() => setPoolConfig({ poolType: 'fiber' })}>
                  Fibra (Redondeada)
                </TypeButton>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Largo (m)" type="number" value={dimensions.length === 0 ? '' : dimensions.length} onChange={(v) => {
                  const val = Number(v);
                  setPoolConfig({ dimensions: { ...dimensions, length: isNaN(val) ? 0 : val } });
                }} placeholder="0" />
                <Input label="Ancho (m)" type="number" value={dimensions.width === 0 ? '' : dimensions.width} onChange={(v) => {
                  const val = Number(v);
                  setPoolConfig({ dimensions: { ...dimensions, width: isNaN(val) ? 0 : val } });
                }} placeholder="0" />
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={hasArc} onChange={(e) => setPoolConfig({ hasArc: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-offset-slate-900" />
                  <span className="text-sm font-medium">Arco Romano</span>
                </label>

                {hasArc && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-8">
                    <label className="text-xs text-slate-400 font-medium mb-2 block uppercase tracking-wider">Ubicación del Arco</label>
                    <div className="flex gap-2">
                      {['top', 'bottom', 'left', 'right'].map((side) => (
                        <button
                          key={side}
                          onClick={() => setPoolConfig({ arcSide: side as any })}
                          className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-all ${arcSide === side
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                        >
                          {side === 'top' ? 'Arriba' : side === 'bottom' ? 'Abajo' : side === 'left' ? 'Izq' : 'Der'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-3 block">Color de Terminación</label>
                <div className="flex flex-wrap gap-3">
                  {['Beige', 'Blanco', 'Gris Claro', 'Gris Oscuro', 'Otro'].map(c => (
                    <button
                      key={c}
                      onClick={() => setPoolConfig({ selectedColor: c })}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${selectedColor === c
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Solarium Expansion */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-orange-400 uppercase tracking-wider mb-6">
                <Palette className="w-4 h-4" /> Expansión Solarium (Hileras)
              </h2>
              <div className="max-w-md mx-auto grid grid-cols-3 gap-4 items-center">
                <div className="col-start-2">
                  <StepperInput label="Arriba" value={solarium.top} onChange={(v) => setSolarium({ top: v })} />
                </div>
                <div className="col-start-1 row-start-2">
                  <StepperInput label="Izquierda" value={solarium.left} onChange={(v) => setSolarium({ left: v })} />
                </div>
                <div className="col-start-3 row-start-2">
                  <StepperInput label="Derecha" value={solarium.right} onChange={(v) => setSolarium({ right: v })} />
                </div>
                <div className="col-start-2 row-start-3">
                  <StepperInput label="Abajo" value={solarium.bottom} onChange={(v) => setSolarium({ bottom: v })} />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
                <Truck className="w-4 h-4" /> Logística
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Transporte" value={transportName} onChange={(v) => setClientInfo({ transportName: v })} />
                <Input label="Costo Envío ($)" type="number" value={shippingCost} onChange={(v) => setClientInfo({ shippingCost: Number(v) })} />
                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={includePastina} onChange={(e) => setClientInfo({ includePastina: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Incluir Pastina (${prices.pastina.price}/kg)</span>
                    </label>
                    {includePastina && (
                      <div className="w-32">
                        <Input label="Cant. (kg)" type="number" value={pastinaQuantity} onChange={(v) => setClientInfo({ pastinaQuantity: Number(v) })} center />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includePallet} onChange={(e) => setClientInfo({ includePallet: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-green-500 focus:ring-offset-slate-900" />
                    <span className="text-sm text-slate-300">Incluir Palletizado ({currentQuote?.palletCount || 0} pallets est.)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Installation Section */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-4 h-4" /> ¿Necesitas colocación?
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setInstallationConfig({ includeInstallation: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-offset-slate-900"
                  />
                  <div>
                    <span className="text-sm font-medium block">Sí, quiero cotizar colocación</span>
                    <p className="text-xs text-slate-500">Mano de obra y cálculo de materiales base.</p>
                  </div>
                </label>

                {includeInstallation && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                    <button
                      onClick={() => setInstallationConfig({ installationType: 'existing' })}
                      className={`p-3 rounded-xl border text-left transition-all ${installationType === 'existing'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                      <span className="text-xs font-bold block uppercase mb-1">Escenario A</span>
                      <span className="text-sm">Tengo carpeta/contrapiso listo</span>
                    </button>
                    <button
                      onClick={() => setInstallationConfig({ installationType: 'new_slab' })}
                      className={`p-3 rounded-xl border text-left transition-all ${installationType === 'new_slab'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                      <span className="text-xs font-bold block uppercase mb-1">Escenario B</span>
                      <span className="text-sm">Es sobre tierra (Hacer hormigón)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Panel: Preview & Quote */}
          <div className="xl:col-span-5 space-y-6 lg:sticky lg:top-8">

            {/* Quote Table (Top as requested in V2) */}
            <div className="bg-slate-800/80 backdrop-blur-2xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" /> Presupuesto
                </h3>
                <div className="text-right">
                  <span className="block text-xs text-slate-500 uppercase">Total Estimado</span>
                  <span className="text-xl font-bold text-emerald-400">${currentQuote?.total?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-slate-400 font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Cant.</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentQuote?.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-200">{item.name}</td>
                        <td className="px-4 py-3 text-center text-slate-400 bg-slate-900/20">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-500 font-mono">${item.unitPrice}</td>
                        <td className="px-4 py-3 text-right text-slate-300 font-mono font-medium">${item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                    {includePallet && (
                      <tr className="bg-green-900/10 text-green-200/80">
                        <td className="px-4 py-3">Palletizado</td>
                        <td className="px-4 py-3 text-center">{currentQuote?.palletCount}</td>
                        <td className="px-4 py-3 text-right font-mono">${prices.pallet.price}</td>
                        <td className="px-4 py-3 text-right font-mono text-green-400">${currentQuote?.palletCost?.toLocaleString() || '0'}</td>
                      </tr>
                    )}
                    {shippingCost > 0 && (
                      <tr className="bg-blue-900/10 text-blue-200/80">
                        <td className="px-4 py-3" colSpan={3}>Envío</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400">${shippingCost.toLocaleString()}</td>
                      </tr>
                    )}
                    {includeInstallation && currentQuote?.installation && (
                      <tr className="bg-cyan-900/10 text-cyan-200/80">
                        <td className="px-4 py-3" colSpan={3}>Mano de Obra Colocación ({currentQuote.installation.laborCost === 0 ? 'Consultar' : 'Aprox.'})</td>
                        <td className="px-4 py-3 text-right font-mono text-cyan-400">${currentQuote.installation.laborCost.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {includeInstallation && currentQuote?.installation && (
                <div className="p-4 bg-slate-900/40 border-t border-white/5">
                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Materiales Sugeridos (A comprar por el cliente)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentQuote.installation.materials.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                        <span className="text-xs text-slate-400">{item.name}</span>
                        <span className="text-xs font-mono text-slate-200">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[9px] text-slate-500 italic text-center">
                    * Los materiales NO están incluidos en el presupuesto de venta de baldosas. Esta lista es estimativa.
                  </p>
                </div>
              )}

              <div className="p-4 bg-slate-900/80 flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                  {isGenerating ? 'Generando...' : 'Exportar PDF'}
                </button>
                <button onClick={() => setIncludePDFImage(!includePDFImage)} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors" title="Incluir imagen">
                  {includePDFImage ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Visualizer (Bottom as requested) */}
            <div ref={visualizerRef} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-inner">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-1">Vista Previa del Diseño</h3>
              <PoolVisualizer
                dimensions={dimensions}
                type={poolType}
                solarium={solarium}
                hasArc={hasArc}
                arcSide={arcSide}
                color={selectedColor}
              />
              <div className="mt-3 flex gap-2 justify-center">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Agua
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="w-2 h-2 rounded-sm bg-slate-600"></span> Borde L
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="w-2 h-2 rounded-sm bg-[#e8dcca]"></span> Baldosa
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main >
  );
}

// Subcomponents for cleaner code within same file
function TypeButton({ children, active, onClick }: TypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
        : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
        }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-1000 ${active ? 'group-hover:translate-x-[100%]' : ''}`} />
      {children}
    </button>
  );
}

interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
  center?: boolean;
}

function Input({ label, value, onChange, type = "text", className = "", placeholder = "", center = false }: InputProps) {
  return (
    <div className={`group ${className}`}>
      <label className={`block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-blue-400 transition-colors ${center ? 'text-center' : ''}`}>{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-200 placeholder-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all font-medium shadow-inner ${center ? 'text-center' : ''}`}
        />
        <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
      </div>
    </div>
  );
}

function StepperInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="group flex flex-col items-center">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-orange-400 transition-colors">{label}</label>
      <div className="flex items-center bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-12 text-center font-bold text-slate-200 text-sm">
          {value}
        </div>
        <button
          onClick={() => onChange(value + 1)}
          className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface TypeButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}
