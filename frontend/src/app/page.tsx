import { getDashboardStats } from "@/lib/api";
import { 
  Activity, 
  Users, 
  Package, 
  FileText 
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardStats();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      
      {/* 3er Grid für Top Stats - Jetzt mit echten Cards */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        
        {/* CARD 1: IN PRODUCTION */}
        <Card className="bg-sidebar border-sidebar-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Production
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.inProduction}</div>
            <p className="text-xs text-muted-foreground">
              Active jobs currently running
            </p>
          </CardContent>
        </Card>

        {/* CARD 2: DRAFTS */}
        <Card className="bg-sidebar border-sidebar-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-400">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              Orders waiting for approval
            </p>
          </CardContent>
        </Card>

        {/* CARD 3: ACTIVE CLIENTS */}
        <Card className="bg-sidebar border-sidebar-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Total customer base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Großer Bereich unten: Recent Activity - Auch als Card */}
      <Card className="flex-1 bg-sidebar border-sidebar-border shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your production line.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent orders.</p>
            ) : (
                recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-sidebar-border hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="font-semibold">{order.customer_name}</div>
                                <div className="text-xs text-muted-foreground">Order #{order.id.slice(0,8)}</div>
                            </div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// Kleiner Helper für die Badges unten rechts
function StatusBadge({ status }: { status: string }) {
    let colorClass = "text-zinc-500 bg-zinc-500/10";
    if (status === "production") colorClass = "text-orange-500 bg-orange-500/10";
    if (status === "done") colorClass = "text-green-500 bg-green-500/10";
    if (status === "confirmed") colorClass = "text-blue-500 bg-blue-500/10";
  
    return (
      <div className={`px-2 py-1 rounded text-xs font-medium uppercase ${colorClass}`}>
        {status}
      </div>
    );
}