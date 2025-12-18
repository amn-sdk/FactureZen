import { Zap } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/20 mb-4">
            <Zap className="h-8 w-8 fill-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Facture<span className="text-indigo-600">Zen</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Professional Document Automation</p>
        </div>
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="p-6">
            {children}
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} FactureZen. All rights reserved.
        </div>
      </div>
    </div>
  )
}
