import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-[#f8fafc] min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
                <footer className="h-20 flex-shrink-0 flex items-center justify-center border-t border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/50 backdrop-blur-md">
                    FactureZen &bull; Professional Edition &bull; 2025
                </footer>
            </main>
        </div>
    )
}
