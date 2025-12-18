"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    FileText,
    Users,
    Library,
    TrendingUp,
    Clock,
    CheckCircle2,
    Plus
} from "lucide-react"

export default function Dashboard() {
    const stats = [
        {
            name: "Total Generated",
            value: "154",
            icon: TrendingUp,
            change: "+12.5%",
            changeType: "increase",
            detail: "vs last month"
        },
        {
            name: "Pending Drafts",
            value: "12",
            icon: Clock,
            change: "-2",
            changeType: "decrease",
            detail: "active now"
        },
        {
            name: "Total Clients",
            value: "48",
            icon: Users,
            change: "+4",
            changeType: "increase",
            detail: "new this week"
        },
        {
            name: "Templates",
            value: "8",
            icon: Library,
            change: "Active",
            changeType: "neutral",
            detail: "across all types"
        },
    ]

    const recentActivity = [
        { id: 1, action: "Invoice generated", target: "Client: Acme Corp", time: "2 hours ago", status: "success" },
        { id: 2, action: "Quote created", target: "Client: Globex", time: "5 hours ago", status: "draft" },
        { id: 3, action: "Template updated", target: "Invoice Modern v2", time: "1 day ago", status: "info" },
    ]

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1 text-lg">Welcome to FactureZen. Here is your business at a glance.</p>
                </div>
                <div className="hidden md:block bg-white px-4 py-2 rounded-xl border shadow-sm text-sm font-medium text-slate-600">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-none shadow-md bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</CardTitle>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <stat.icon className="h-4 w-4 text-slate-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                            <div className="flex items-center mt-1">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${stat.changeType === "increase" ? "bg-green-100 text-green-700" :
                                        stat.changeType === "decrease" ? "bg-amber-100 text-amber-700" :
                                            "bg-slate-100 text-slate-700"
                                    }`}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-400 ml-2">{stat.detail}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="shadow-lg border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                <div className={`mt-1 p-1.5 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                        activity.status === 'draft' ? 'bg-blue-100 text-blue-600' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {activity.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-slate-900">{activity.action}</div>
                                    <div className="text-xs text-slate-500">{activity.target}</div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">{activity.time}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-none bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 group cursor-pointer">
                            <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-center">New Document</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 group cursor-pointer">
                            <Users className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-center">Add Client</span>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
