"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    FileText,
    User,
    Settings,
    RefreshCw,
    Eye,
    CheckCircle2,
    AlertCircle,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api, API_URL } from "@/lib/api"
import { toast } from "sonner"

interface Document {
    id: number
    type: string
    status: string
    updated_at: string
    template_id: number
    client_id: number
    current_data: Record<string, string>
}

interface Template {
    id: number
    name: string
    version: number
    type: string
    schema_json?: {
        properties?: Record<string, { title?: string }>
    }
}

interface Client {
    id: number
    name: string
    address?: string
    created_at: string
}

interface DocumentVersion {
    id: number
    doc_number: string
    version_number: number
}

export default function DocumentEditor() {
    const { id } = useParams()
    const router = useRouter()
    const [doc, setDoc] = useState<Document | null>(null)
    const [template, setTemplate] = useState<Template | null>(null)
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [versions, setVersions] = useState<DocumentVersion[]>([])

    const loadData = useCallback(async () => {
        try {
            const [docData, versionsData] = await Promise.all([
                api.get(`/documents/${id}`),
                api.get(`/documents/${id}/versions`)
            ])
            setDoc(docData)
            setFormData(docData.current_data || {})
            setVersions(versionsData)

            const [templateData, clientData] = await Promise.all([
                api.get(`/templates/${docData.template_id}`),
                api.get(`/clients/${docData.client_id}`)
            ])
            setTemplate(templateData)
            setClient(clientData)
        } catch (err) {
            const error = err as Error
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        loadData()
    }, [loadData])

    async function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault()
        setSaving(true)
        try {
            await api.patch(`/documents/${id}`, {
                current_data: formData
            })
            toast.success("Progress saved")
        } catch (err) {
            const error = err as Error
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleGenerate() {
        setGenerating(true)
        try {
            await api.post(`/documents/${id}/generate`, {})
            toast.success("Generation started! You will be notified when ready.")
            router.push("/documents")
        } catch (err) {
            const error = err as Error
            toast.error(error.message)
        } finally {
            setGenerating(false)
        }
    }

    async function handlePreview() {
        try {
            const res = await fetch(`${API_URL}/templates/${doc.template_id}/test-render`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error("Preview generation failed")
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `preview_${doc.type}_${doc.id}.docx`
            document.body.appendChild(a)
            a.click()
            a.remove()
            toast.success("Preview DOCX downloaded")
        } catch (err) {
            const error = err as Error
            toast.error(error.message)
        }
    }

    if (loading) return <div className="flex justify-center py-20 animate-pulse text-slate-400">Loading editor...</div>
    if (!doc) return <div>Document not found</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/documents")} className="rounded-2xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{doc.type} Draft</h1>
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200">
                                {doc.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Draft #{id} &bull; Updated {new Date(doc.updated_at).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={handlePreview} className="rounded-xl border-slate-200 shadow-sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview DOCX
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating || doc.status === 'GENERATED'}
                        className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/20 px-6 font-bold"
                    >
                        {generating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Generate Final
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 px-6"
                    >
                        {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                        <div className="bg-slate-900 p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-white">
                                <Settings className="h-5 w-5 text-indigo-400" />
                                <span className="font-bold tracking-tight">Template Variables</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded text-white/50 font-bold">
                                Dynamic Form
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <form onSubmit={handleSave} className="space-y-8">
                                {template?.schema_json?.properties ? (
                                    <div className="grid gap-6">
                                        {Object.keys(template.schema_json.properties).map((key) => {
                                            const prop = template.schema_json.properties[key]
                                            return (
                                                <div key={key} className="space-y-2 group">
                                                    <Label htmlFor={key} className="text-sm font-bold text-slate-700 group-focus-within:text-indigo-600 transition-colors">
                                                        {prop.title || key}
                                                    </Label>
                                                    <Input
                                                        id={key}
                                                        value={formData[key] || ""}
                                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                                        className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl h-12"
                                                        placeholder={`Enter ${key}...`}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-400 italic">
                                        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No dynamic variables found in this template.
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Context Section */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md rounded-3xl bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
                                <User className="h-3 w-3 mr-2" /> Client Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-black text-slate-900 leading-tight">{client?.name}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-tight">Client Since {new Date(client?.created_at).getFullYear()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600">
                                {client?.address || "No address provided"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md rounded-3xl bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
                                <FileText className="h-3 w-3 mr-2" /> Selected Template
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3">
                                <div className="bg-indigo-50 p-2.5 rounded-xl">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{template?.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Version {template?.version}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-green-50 rounded-3xl p-6 border border-green-100 border-dashed">
                        <div className="flex items-center space-x-3 text-green-700 mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-bold text-sm">Status: {doc.status}</span>
                        </div>
                        <p className="text-xs text-green-600 font-medium leading-relaxed">
                            {doc.status === 'DRAFT'
                                ? "Your data is stored in the database. You can generate the final PDF once all variables are filled."
                                : "The final versions have been generated and are available for download below."}
                        </p>
                    </div>

                    {versions.length > 0 && (
                        <Card className="border-none shadow-md rounded-3xl bg-slate-900 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-white/10">
                                <CardTitle className="text-xs uppercase tracking-widest text-indigo-400 font-bold flex items-center">
                                    <Clock className="h-3 w-3 mr-2" /> Generated Versions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {versions.map((v) => (
                                        <div key={v.id} className="p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-bold text-sm tracking-tight">{v.doc_number}</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">REV {v.version_number}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold h-8"
                                                    onClick={() => window.open(`${API_URL}/documents/${id}/download/${v.id}?file_type=pdf`, '_blank')}
                                                >
                                                    <FileText className="h-3 w-3 mr-2" /> PDF
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold h-8"
                                                    onClick={() => window.open(`${API_URL}/documents/${id}/download/${v.id}?file_type=docx`, '_blank')}
                                                >
                                                    <FileText className="h-3 w-3 mr-2 opacity-50" /> DOCX
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
