import { getDashboardStats } from "@/lib/api";
import Link from "next/link";
import { 
  Package, 
  Users, 
  Activity, 
  CheckCircle, 
  Clock, 
  FileText, 
  ArrowRight 
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  // Daten vom Backend laden
  const data = await getDashboardStats();
  const { stats, recentOrders } = data;

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your production pipeline.</p>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Orders */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time records</p>
          </CardContent>
        </Card>

        {/* In Production (Highlight) */}
        <Card className="bg-blue-950/20 border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">In Production</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-100">{stats.inProduction}</div>
            <p className="text-xs text-blue-400/70">Active jobs right now</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished jobs</p>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Orders List (Nimmt 4 Spalten ein) */}
        <Card className="col-span-4 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {order.customer_name || "Unknown Client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "dd. MMM HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant={order.status === "production" ? "default" : "outline"}>
                            {order.status}
                        </Badge>
                        <div className="text-sm font-medium w-8 text-right">
                           {/* Summe der Quantities aller Items in der Order */}
                           {order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (Nimmt 3 Spalten ein) */}
        <Card className="col-span-3 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/clients">
                <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" /> Manage Clients
                </Button>
            </Link>
            <Link href="/products">
                <Button className="w-full justify-start" variant="outline">
                    <Package className="mr-2 h-4 w-4" /> Manage Products
                </Button>
            </Link>
            <div className="mt-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" /> System Status
                </p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>All services operational</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}