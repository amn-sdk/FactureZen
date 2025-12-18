"use client"

import { useEffect, useState } from "react"
import { Plus, Search, FileText, Trash2, Download } from "lucide-react"
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
import { api, API_URL } from "@/lib/api"
import { toast } from "sonner"

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    async function loadTemplates() {
        try {
            const data = await api.get("/templates/")
            setTemplates(data)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTemplates()
    }, [])

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setUploading(true)

        const formData = new FormData(e.currentTarget)
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement

        if (!fileInput.files?.[0]) {
            toast.error("Please select a file")
            setUploading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/templates/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || "Upload failed")
            }

            toast.success("Template uploaded successfully")
            setOpen(false)
            loadTemplates()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(id: number) {
        try {
            await api.get(`/templates/${id}`, { method: "DELETE" })
            toast.success("Template deleted")
            loadTemplates()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
                    <p className="text-slate-500 text-sm">Manage your DOCX document templates</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleUpload}>
                            <DialogHeader>
                                <DialogTitle>Upload Template</DialogTitle>
                                <DialogDescription>
                                    Upload a DOCX file with jinja2 placeholders.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name</Label>
                                    <Input id="name" name="name" placeholder="Invoice Modern" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Document Type</Label>
                                    <Select name="type" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="QUOTE">Quote</SelectItem>
                                            <SelectItem value="INVOICE">Invoice</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">DOCX File</Label>
                                    <Input id="file" name="file" type="file" accept=".docx" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? "Uploading..." : "Upload"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div>Loading...</div>
                ) : templates.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>No templates yet. Upload your first DOCX template.</p>
                        </CardContent>
                    </Card>
                ) : (
                    templates.map((template: any) => (
                        <Card key={template.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                                                {template.type}
                                            </span>
                                            <span>•</span>
                                            <span>v{template.version}</span>
                                            <span>•</span>
                                            <span>{new Date(template.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={template.docx_source_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
