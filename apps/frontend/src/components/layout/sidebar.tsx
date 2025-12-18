"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Settings, LogOut, Library } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Templates", href: "/templates", icon: Library },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 border-right bg-white min-h-screen border-r">
            <div className="flex items-center h-16 px-6 border-b">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                    Facture<span className="text-primary">Zen</span>
                </span>
            </div>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                        isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t p-4">
                <button
                    onClick={() => {
                        localStorage.removeItem("token")
                        window.location.href = "/login"
                    }}
                    className="group flex items-center px-2 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-700 w-full transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
                    Logout
                </button>
            </div>
        </div>
    )
}
