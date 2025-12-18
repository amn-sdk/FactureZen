import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-[#f8fafc] min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                    {children}
                </div>
                <footer className="h-20 flex items-center justify-center border-t border-slate-200 text-slate-400 text-xs font-medium uppercase tracking-widest">
                    FactureZen &bull; Professional Edition &bull; 2025
                </footer>
            </main>
        </div>
    )
}
