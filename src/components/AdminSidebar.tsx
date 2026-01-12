'use client';

import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Calculator,
    Package,
    History,
    Settings,
    LogOut
} from 'lucide-react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
    >
        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>}
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
        {active && <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>}
    </button>
);

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
    const navItems = [
        { id: 'overview', label: 'Vista General', icon: LayoutDashboard },
        { id: 'builder', label: 'Cotizador', icon: Calculator },
        { id: 'catalog', label: 'Productos & Precios', icon: Package },
        { id: 'history', label: 'Historial', icon: History },
        { id: 'settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <aside className="w-72 h-screen sticky top-0 bg-slate-950 border-r border-slate-800/50 flex flex-col p-6 z-50 shadow-2xl shadow-blue-900/5">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-10 px-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    AC
                </div>
                <div>
                    <h2 className="text-white font-bold tracking-tight text-lg leading-tight">Admin<span className="text-blue-500">Pro</span></h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">Atérmicos Celina</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    />
                ))}
            </nav>

            {/* User / Footer */}
            <div className="pt-6 border-t border-slate-800/50 space-y-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs text-white font-bold">
                            AD
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">Administrador</p>
                        <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En línea
                        </p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group"
                >
                    <LogOut className="w-4 h-4 rotate-180 group-hover:text-red-400 transition-colors" />
                    <span className="font-medium text-xs uppercase tracking-wider group-hover:text-red-400 transition-colors">Cerrar Sesión</span>
                </Link>
            </div>
        </aside>
    );
}
