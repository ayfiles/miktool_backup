import Link from "next/link";
import { getDashboardStats } from "@/lib/api";
import { 
  Box, 
  Users, 
  FileText, 
  Activity, 
  ArrowRight, 
  Archive 
} from "lucide-react";

// ✅ NEU: shadcn Komponenten importieren
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardStats();

  return (
    <main className="pb-20 space-y-8">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Command Center
        </h1>
        <p className="text-muted-foreground mt-2 ml-11">
          Übersicht der aktuellen Produktion
        </p>
      </header>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* CARD 1: Production */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">
              IN PRODUCTION
            </CardTitle>
            <Box className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProduction}</div>
            <p className="text-xs text-muted-foreground">Active jobs</p>
          </CardContent>
        </Card>

        {/* CARD 2: Drafts */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              DRAFTS
            </CardTitle>
            <FileText className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-300">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Waiting for approval</p>
          </CardContent>
        </Card>

         {/* CARD 3: Clients */}
         <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              ACTIVE CLIENTS
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Total database</p>
          </CardContent>
        </Card>

        {/* CARD 4: Total Orders */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">
              TOTAL ORDERS
            </CardTitle>
            <Archive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time volume</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        {/* LINKS: RECENT ACTIVITY (Nimmt 4 von 7 Spalten) */}
        <Card className="col-span-4 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-0 pt-0">
            <div className="space-y-0">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No activity yet.</div>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center">
                         <FileText className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none text-white">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <Link href={`/clients`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t border-zinc-800 text-center">
            <Link href="/clients" className="text-xs text-muted-foreground hover:text-white transition-colors">
              View all orders
            </Link>
          </div>
        </Card>

        {/* RECHTS: QUICK ACTIONS (Nimmt 3 von 7 Spalten) */}
        <div className="col-span-3 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
          
          <Link href="/clients" className="block">
            <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Manage Clients</h3>
                  <p className="text-xs text-muted-foreground">View list & add new</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <Box className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Inventory</h3>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}

// Kleine Hilfskomponente für Badges (nutzt jetzt shadcn Badge)
function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let className = "text-zinc-400 border-zinc-700"; // Default: Draft

  if (status === "production") { 
    className = "text-orange-400 border-orange-400/30 bg-orange-400/10";
  }
  if (status === "done") { 
    className = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  }
  if (status === "confirmed") { 
    className = "text-blue-400 border-blue-400/30 bg-blue-400/10";
  }

  return (
    <Badge variant="outline" className={`${className} uppercase text-[10px] tracking-wide`}>
      {status}
    </Badge>
  );
}