"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [company, setCompany] = useState({
        name: "",
        legal_form: "",
        address: "",
        vat_number: "",
        registration_number: ""
    })

    useEffect(() => {
        async function loadCompany() {
            try {
                const data = await api.get("/companies/me")
                setCompany(data)
            } catch (err: any) {
                toast.error(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadCompany()
    }, [])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch("/companies/me", company)
            toast.success("Settings updated successfully")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

            <form onSubmit={onSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Company Profile</CardTitle>
                        <CardDescription>Configure your company legal informations for documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                value={company.name}
                                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="legal_form">Legal Form</Label>
                                <Input
                                    id="legal_form"
                                    value={company.legal_form || ""}
                                    onChange={(e) => setCompany({ ...company, legal_form: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration_number">Registration Number (SIRET)</Label>
                                <Input
                                    id="registration_number"
                                    value={company.registration_number || ""}
                                    onChange={(e) => setCompany({ ...company, registration_number: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vat_number">VAT Number</Label>
                            <Input
                                id="vat_number"
                                value={company.vat_number || ""}
                                onChange={(e) => setCompany({ ...company, vat_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={company.address || ""}
                                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
