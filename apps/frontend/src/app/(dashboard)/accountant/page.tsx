"use client"

import { useEffect, useState } from "react"
import {
    Building2,
    Download,
    Lock,
    ChevronRight,
    FileSpreadsheet,
    ShieldCheck,
    ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, API_URL } from "@/lib/api"
import { toast } from "sonner"

interface Company {
    id: number
    name: string
    registration_number?: string
    period_locked_until?: string
}

export default function AccountantPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)

    async function loadCompanies() {
        try {
            const data = await api.get("/accountant/companies")
            setCompanies(data)
        } catch (err) {
            const error = err as Error
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCompanies()
    }, [])

    function handleSwitchCompany(companyId: number) {
        // Logic to switch current company context
        // For dev bypass, we might need an endpoint to "impersonate" or change company_id
        toast.info(`Switching to company #${companyId}...`)
        // In a real app, this would update a session/cookie or local state
        localStorage.setItem("current_company_id", companyId.toString())
        window.location.href = "/dashboard"
    }

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 w-full bg-slate-100 animate-pulse rounded-2xl" />
            ))}
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <ShieldCheck className="mr-3 h-8 w-8 text-indigo-600" />
                        Espace Expert-Comptable
                    </h1>
                    <p className="text-slate-500 mt-1">Gérez plusieurs dossiers clients et exportez les écritures comptables.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200">
                    <Download className="mr-2 h-4 w-4" />
                    Archive Globale
                </Button>
            </div>

            <div className="grid gap-6">
                {companies.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <Building2 className="h-10 w-10 mb-4 opacity-20" />
                            <p className="font-semibold text-slate-900">Aucun dossier client trouvé</p>
                            <p className="text-sm mt-1">Vous n&apos;êtes assigné à aucune entreprise en tant que comptable.</p>
                        </CardContent>
                    </Card>
                ) : (
                    companies.map((company) => (
                        <Card key={company.id} className="hover:shadow-lg transition-all border-slate-100 group overflow-hidden">
                            <div className="flex h-full">
                                <div className="w-2 bg-indigo-600" />
                                <CardContent className="flex-1 flex items-center justify-between p-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <Building2 className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{company.name}</h3>
                                            <div className="flex items-center space-x-4 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                <span>SIRET: {company.registration_number || "N/A"}</span>
                                                <span className="text-slate-200">|</span>
                                                <div className="flex items-center text-amber-600">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Verrouillé: {company.period_locked_until ? new Date(company.period_locked_until).toLocaleDateString() : "Aucun"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Button
                                            variant="secondary"
                                            className="rounded-xl font-bold bg-slate-100 hover:bg-slate-200"
                                            onClick={() => window.open(`${API_URL}/documents/export/csv`, "_blank")}
                                        >
                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                            Export CSV
                                        </Button>
                                        <Button
                                            onClick={() => handleSwitchCompany(company.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 rounded-xl px-6 font-bold"
                                        >
                                            Accéder au Dossier
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-slate-900 border-none rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                    <ArrowRightLeft className="h-8 w-8 text-indigo-400 mb-4" />
                    <h4 className="font-bold text-lg mb-2">Multi-tenancy</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Basculez entre vos différents dossiers clients sans vous déconnecter. L&apos;isolation des données est garantie par RLS.
                    </p>
                </Card>
                <Card className="bg-slate-900 border-none rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                    <FileSpreadsheet className="h-8 w-8 text-green-400 mb-4" />
                    <h4 className="font-bold text-lg mb-2">Exports FEC & CSV</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Générez des exports comptables conformes au format FEC ou des extractions CSV personnalisables.
                    </p>
                </Card>
                <Card className="bg-slate-900 border-none rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                    <Lock className="h-8 w-8 text-amber-400 mb-4" />
                    <h4 className="font-bold text-lg mb-2">Périodes Verrouillées</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Sécurisez les données en verrouillant les périodes fiscales clôturées pour empêcher toute modification.
                    </p>
                </Card>
            </div>
        </div>
    )
}
