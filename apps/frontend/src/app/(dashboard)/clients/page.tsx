"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ClientsPage() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    async function loadClients() {
        try {
            const data = await api.get(`/clients?search=${search}`)
            setClients(data)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClients()
    }, [search])

    async function handleArchive(id: number) {
        try {
            await api.post(`/clients/${id}/archive`, {})
            toast.success("Client archived")
            loadClients()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
                    <p className="text-slate-500 text-sm">Manage your customer database</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -get -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No clients found.</div>
                ) : (
                    clients.map((client: any) => (
                        <Card key={client.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{client.name}</h3>
                                    <p className="text-sm text-slate-500">{client.email || "No email"}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleArchive(client.id)}>
                                        <Archive className="h-4 w-4 text-slate-500" />
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
