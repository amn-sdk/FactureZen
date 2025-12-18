"use client"

import { useEffect, useState } from "react"
import {
    Plus,
    Search,
    FileText,
    MoreVertical,
    Trash2,
    ExternalLink,
    PlusCircle,
    Clock,
    Users,
    CheckCircle2,
    FileBadge
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
    const router = useRouter()
    const [documents, setDocuments] = useState([])
    const [templates, setTemplates] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [newDocOpen, setNewDocOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    // Wizard state
    const [targetTemplate, setTargetTemplate] = useState("")
    const [targetClient, setTargetClient] = useState("")

    async function loadData() {
        try {
            const [docsData, templatesData, clientsData] = await Promise.all([
                api.get("/documents/"),
                api.get("/templates/"),
                api.get("/clients/")
            ])
            setDocuments(docsData)
            setTemplates(templatesData)
            setClients(clientsData.filter((c: any) => !c.is_archived))
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!targetTemplate || !targetClient) {
            toast.error("Please select a template and a client")
            return
        }

        setCreating(true)
        const template = templates.find((t: any) => t.id.toString() === targetTemplate) as any

        try {
            const newDoc = await api.post("/documents/", {
                client_id: parseInt(targetClient),
                template_id: parseInt(targetTemplate),
                type: template.type,
                current_data: {},
                current_totals: {}
            })

            toast.success("Document draft created")
            setNewDocOpen(false)
            // Redirect to the editor page (to be created)
            router.push(`/documents/${newDoc.id}`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setCreating(false)
        }
    }

    async function handleDelete(id: number) {
        try {
            await api.delete(`/documents/${id}`)
            toast.success("Document deleted")
            loadData()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
                    <p className="text-slate-500 mt-1">Manage your document life-cycle from draft to generation</p>
                </div>

                <Dialog open={newDocOpen} onOpenChange={setNewDocOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Create New Document</DialogTitle>
                                <DialogDescription>
                                    Select a template and a client to start a new draft.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="template">Template Model</Label>
                                    <Select onValueChange={setTargetTemplate} value={targetTemplate} required>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Choose a model..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.name} ({t.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select onValueChange={setTargetClient} value={targetClient} required>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Choose a client..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setNewDocOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating} className="bg-indigo-600">
                                    {creating ? "Creating..." : "Start Drafting"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 border border-slate-100">
                                <FileBadge className="h-10 w-10 text-slate-300" />
                            </div>
                            <p className="font-semibold text-slate-900">No documents yet</p>
                            <p className="text-sm mt-1 mb-6">Create your first draft by clicking "New Document"</p>
                            <Button variant="outline" onClick={() => setNewDocOpen(true)}>
                                Get Started
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {documents.map((doc: any) => (
                            <Card key={doc.id} className="hover:shadow-md transition-all border-slate-100 group">
                                <CardContent className="flex items-center justify-between p-5">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn(
                                            "p-3 rounded-2xl shadow-sm border",
                                            doc.status === 'DRAFT' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-green-50 text-green-600 border-green-100"
                                        )}>
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {doc.type} #{doc.id}
                                                </h3>
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border",
                                                    doc.status === 'DRAFT' ? "bg-amber-100/50 text-amber-700 border-amber-200" : "bg-green-100/50 text-green-700 border-green-200"
                                                )}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-y-0.5 text-xs text-slate-400 font-semibold mt-1">
                                                <Users className="h-3 w-3 mr-1" />
                                                <span>Client ID: {doc.client_id}</span>
                                                <span className="mx-2 text-slate-200">|</span>
                                                <Clock className="h-3 w-3 mr-1" />
                                                <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => router.push(`/documents/${doc.id}`)}
                                            className="rounded-xl font-bold gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Open Editor
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(doc.id)}
                                            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
