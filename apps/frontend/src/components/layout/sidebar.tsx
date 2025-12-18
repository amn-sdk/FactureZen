"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Library,
    Zap,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Templates", href: "/templates", icon: Library },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Expert-Comptable", href: "/accountant", icon: ShieldCheck },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-72 bg-slate-900 text-slate-300 min-h-screen shadow-2xl">
            <div className="flex items-center h-20 px-8 mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                        <Zap className="h-6 w-6 fill-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">
                        Facture<span className="text-indigo-400">Zen</span>
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-4 space-y-8 overflow-y-auto">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200",
                                    isActive
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                    )}
                                />
                                {item.name}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-white/5">
                <button
                    onClick={() => {
                        localStorage.removeItem("token")
                        window.location.href = "/login"
                    }}
                    className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-400 rounded-2xl hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200 cursor-pointer"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </div>
    )
}
