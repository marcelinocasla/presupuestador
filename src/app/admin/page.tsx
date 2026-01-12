'use client';

import { useAdminStore } from '@/store/adminStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useState, useEffect } from 'react';
import {
    Save,
    Building2,
    DollarSign,
    TrendingUp,
    Users,
    Layers,
    CheckCircle2,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Edit3,
    Plus,
    X
} from 'lucide-react';
import { PriceList, CompanyInfo } from '@/types';
import AdminSidebar from '@/components/AdminSidebar';
import QuotePage from '@/app/page';

export default function AdminPage() {
    const { prices, companyInfo, updatePrices, updateCompanyInfo } = useAdminStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-medium tracking-widest uppercase text-xs">Cargando Nano Banana Panel...</div>;

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[15s]"></div>
            </div>

            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 p-8 overflow-y-auto relative z-10 custom-scrollbar">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {activeTab === 'overview' && 'Vista General'}
                            {activeTab === 'builder' && 'Cotizador Profesional'}
                            {activeTab === 'catalog' && 'Catálogo & Precios'}
                            {activeTab === 'history' && 'Historial de Operaciones'}
                            {activeTab === 'settings' && 'Configuración Global'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium tracking-wide">Panel de Control Administrativo • v2.0</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-md shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/50" />
                            Sistema Online
                        </div>
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
                    {activeTab === 'builder' && <div className="scale-[0.98] origin-top opacity-90 hover:opacity-100 transition-opacity"><QuotePage /></div>}
                    {activeTab === 'catalog' && <CatalogTab prices={prices} updatePrices={updatePrices} />}
                    {activeTab === 'history' && <HistoryTab />}
                    {activeTab === 'settings' && <SettingsTab info={companyInfo} updateInfo={updateCompanyInfo} />}
                </div>
            </main>
        </div>
    );
}

// --- TAB COMPONENTS (NANO BANANA PRO) ---

function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    const { history } = useAdminStore();
    const { loadFullQuote } = useQuoteStore();

    // Calculate Real Stats
    const totalIncome = history
        .filter(h => h.status === 'approved')
        .reduce((sum, h) => sum + h.total, 0);

    const quoteCount = history.length;

    // Simple heuristic for "Close Rate" - assume approved / total (though in this app 'approved' means Generated PDF for now)
    // Let's treat 'approved' as generated.

    // We can show "Generated Today" vs Total?
    const today = new Date().toISOString().split('T')[0];
    const todayCount = history.filter(h => h.date.startsWith(today)).length;

    const uniqueClients = new Set(history.map(h => h.clientName)).size;

    const stats = [
        { label: 'Ingresos Estimados', value: `$${totalIncome.toLocaleString()}`, trend: 'Total Histórico', up: true, icon: DollarSign, color: 'from-blue-500 to-cyan-400' },
        { label: 'Presupuestos', value: quoteCount.toString(), trend: `+${todayCount} hoy`, up: true, icon: Layers, color: 'from-purple-500 to-pink-400' },
        { label: 'Ticket Promedio', value: quoteCount > 0 ? `$${Math.round(totalIncome / quoteCount).toLocaleString()}` : '$0', trend: 'Global', up: true, icon: TrendingUp, color: 'from-emerald-500 to-teal-400' },
        { label: 'Clientes Únicos', value: uniqueClients.toString(), trend: 'Activos', up: true, icon: Users, color: 'from-orange-500 to-red-400' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="relative bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-[0.1] transition-opacity`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-10 text-white shadow-lg shadow-black/20`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-950/50 border border-slate-800 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom SVG Chart Area */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Actividad Reciente</h3>
                            <p className="text-sm text-slate-500">Volumen de presupuestos generados</p>
                        </div>
                    </div>

                    {/* Simple CSS/SVG Line Chart - Static for aesthetic for now, connecting later would be complex chart.js job */}
                    <div className="h-64 w-full relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-600 font-mono">
                            {[100, 75, 50, 25, 0].map(val => (
                                <div key={val} className="w-full border-t border-slate-800/50 pt-1">{val}%</div>
                            ))}
                        </div>
                        {/* Chart Path */}
                        <svg className="absolute inset-0 w-full h-full pt-4 pb-6 overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,180 C50,150 100,200 150,120 C200,50 250,80 300,60 C350,40 400,90 450,50 C500,10 550,40 600,20 L600,220 L0,220 Z"
                                fill="url(#chartGradient)"
                            />
                            <path
                                d="M0,180 C50,150 100,200 150,120 C200,50 250,80 300,60 C350,40 400,90 450,50 C500,10 550,40 600,20"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </svg>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 shadow-xl flex flex-col">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Últimos Presupuestos
                    </h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {history.slice(0, 10).map((item, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors cursor-default group border border-transparent hover:border-slate-800/50 items-center">
                                <div className={`w-10 h-10 rounded-xl bg-blue-500 bg-opacity-10 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10 group-hover:ring-white/30 transition-all`}>
                                    {item.clientName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{item.clientName}</p>
                                    <p className="text-xs text-slate-500 font-medium">#{item.id.slice(0, 8)}</p>
                                </div>
                                <div className="text-right mr-2">
                                    <p className="text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors">${item.total.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-600">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            if (!item.config) {
                                                alert('Este presupuesto es antiguo y no tiene configuración guardada para editar.');
                                                return;
                                            }
                                            loadFullQuote(item.config, {
                                                name: item.clientName,
                                                phone: '',
                                                address: '',
                                                transport: ''
                                            });
                                            setActiveTab('builder');
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${!item.config ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400'}`}
                                        title={item.config ? "Editar" : "No editable"}
                                        disabled={!item.config}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('¿Eliminar este presupuesto?')) useAdminStore.getState().removeQuoteFromHistory(item.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-xs text-slate-600 text-center py-4 text-balance">Comienza generando un nuevo presupuesto en la pestaña "Cotizador".</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CatalogTabProps {
    prices: PriceList;
    updatePrices: (prices: PriceList) => void;
}

function CatalogTab({ prices, updatePrices }: CatalogTabProps) {
    const [localPrices, setLocalPrices] = useState(prices);

    // Auto-save simulation or manual save
    const handleSave = () => {
        updatePrices(localPrices);
        // Could add toast here
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-sm">
                <div>
                    <h3 className="text-xl font-bold text-white">Catálogo de Productos</h3>
                    <p className="text-slate-500 text-sm mt-1">Gestione los costos unitarios base para el cálculo.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all flex items-center gap-2 hover:bg-slate-800">
                        <Filter className="w-4 h-4" /> Filtrar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-950/80 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[200px]">Item</th>
                            <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Stock Disp.</th>
                            <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Cantidad</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Opciones / Colores</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Precio Unitario</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {Object.entries(localPrices).map(([key, val]: [string, any]) => {
                            const name = key.replace(/([A-Z])/g, ' $1').trim();

                            return (
                                <tr key={key} className="group hover:bg-blue-500/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors ring-1 ring-slate-700 group-hover:ring-blue-500/30">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-200 capitalize group-hover:text-white transition-colors">{name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => setLocalPrices({ ...localPrices, [key]: { ...val, inStock: !val.inStock } })}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${val.inStock ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${val.inStock ? 'bg-emerald-500' : 'bg-red-500'} ${val.inStock ? 'animate-pulse' : ''}`} />
                                            {val.inStock ? 'DISPONIBLE' : 'SIN STOCK'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                value={val.stock}
                                                onChange={(e) => setLocalPrices({ ...localPrices, [key]: { ...val, stock: Number(e.target.value) } })}
                                                className="w-20 bg-slate-950/50 border border-slate-800 rounded-lg px-2 py-1.5 text-center font-mono text-xs text-slate-400 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {val.colors?.map((c: string, ci: number) => (
                                                <span key={ci} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1">
                                                    {c}
                                                    <button
                                                        onClick={() => {
                                                            const newColors = [...val.colors];
                                                            newColors.splice(ci, 1);
                                                            setLocalPrices({ ...localPrices, [key]: { ...val, colors: newColors } });
                                                        }}
                                                        className="hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </span>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const color = prompt('Nombre del color:');
                                                    if (color) {
                                                        const newColors = [...(val.colors || []), color];
                                                        setLocalPrices({ ...localPrices, [key]: { ...val, colors: newColors } });
                                                    }
                                                }}
                                                className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] text-blue-400 border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500/20 transition-all"
                                            >
                                                <Plus className="w-2.5 h-2.5" /> Nuevo
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block group-hover:scale-105 transition-transform">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                                            <input
                                                type="number"
                                                value={val.price}
                                                onChange={(e) => setLocalPrices({ ...localPrices, [key]: { ...val, price: Number(e.target.value) } })}
                                                className="w-32 bg-slate-950 border border-slate-700/50 rounded-lg pl-6 pr-3 py-2 text-right font-mono text-emerald-400 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-inner"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function HistoryTab() {
    const { history } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = history.filter(h =>
        h.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.id.includes(searchTerm)
    );

    return (
        <div className="space-y-6">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        placeholder="Buscar por cliente, ID o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all shadow-lg"
                    />
                </div>
                <button className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl">
                    <Filter className="w-4 h-4" /> Filtros Avanzados
                </button>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-950/80 text-left border-b border-slate-800">
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">ID</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Cliente</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Fecha</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Estado</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Total</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-400 group-hover:text-blue-400 transition-colors">#{item.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4 font-medium text-white">{item.clientName}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            item.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {item.status === 'approved' ? 'Generado' : item.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-200">${item.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 transition-colors" title="Ver PDF">
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs uppercase tracking-widest font-medium">
                                    No se encontraron registros en el historial
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface SettingsTabProps {
    info: CompanyInfo;
    updateInfo: (info: CompanyInfo) => void;
}

function SettingsTab({ info, updateInfo }: SettingsTabProps) {
    const [localInfo, setLocalInfo] = useState(info);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        updateInfo(localInfo);
        setTimeout(() => setSaving(false), 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Branding form */}
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-8 shadow-xl space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" /> Identidad Corporativa
                    </h3>
                    <p className="text-slate-500 text-sm">Sera utilizada en el encabezado de los PDFs generados.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Nombre de Empresa" value={localInfo.name} onChange={(v) => setLocalInfo({ ...localInfo, name: v })} />
                    <Field label="Teléfono / WhatsApp" value={localInfo.phone} onChange={(v) => setLocalInfo({ ...localInfo, phone: v })} />
                    <div className="md:col-span-2">
                        <Field label="Dirección Comercial" value={localInfo.address} onChange={(v) => setLocalInfo({ ...localInfo, address: v })} />
                    </div>
                    <div className="md:col-span-2">
                        <Field label="URL del Logo (PNG/JPG)" value={localInfo.logoUrl} onChange={(v) => setLocalInfo({ ...localInfo, logoUrl: v })} placeholder="https://ejemplo.com/logo.png" />
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">✨ Recomendamos usar una imagen transparente (PNG) de al menos 500x500px.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center gap-2 ${saving ? 'bg-emerald-500 scale-95 ring-4 ring-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 hover:scale-[1.02]'
                            }`}
                    >
                        {saving ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardado Exitoso' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Preview Card */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 h-fit sticky top-8">
                <div className="w-32 h-32 rounded-full bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors shadow-2xl">
                    {localInfo.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={localInfo.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="text-slate-600 group-hover:text-blue-500 transition-colors">
                            <span className="text-xs font-bold uppercase block mb-1">Sin Logo</span>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-white font-bold text-xl tracking-tight">{localInfo.name || 'Su Empresa'}</h4>
                    <p className="text-slate-500 text-sm mt-1">{localInfo.address || 'Dirección de ejemplo 123'}</p>
                </div>
                <div className="w-full pt-6 border-t border-slate-800/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Vista previa Header PDF</p>
                    <div className="h-2 w-full bg-slate-800 rounded-full mb-2 opacity-50 animate-pulse"></div>
                    <div className="h-2 w-2/3 bg-slate-800 rounded-full mx-auto opacity-30"></div>
                </div>
            </div>
        </div>
    );
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
    return (
        <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-blue-400 transition-colors">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder-slate-700 shadow-inner focus:bg-slate-950"
            />
        </div>
    );
}
