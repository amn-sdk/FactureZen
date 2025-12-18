export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Facture<span className="text-primary">Zen</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
