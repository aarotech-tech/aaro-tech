import { PageHeader } from "@/components/ui/page-header";
import { analyticsService } from "@/modules/analytics/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPaiseToINR } from "@/lib/currency";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";

export default async function ReportsPage() {
  const [revenueStats, salesFunnel, pipeline] = await Promise.all([
    analyticsService.getRevenueStats(),
    analyticsService.getSalesFunnel(),
    analyticsService.getPipelineForecast()
  ]);

  return (
    <div className="h-full overflow-y-auto flex flex-col print:bg-white print:text-black">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Reports & Analytics"
          description="Business intelligence and key performance metrics."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Reports" }
          ]}
          primaryAction={<PrintButton />}
        />
      </div>

      <div className="p-6 pt-6 flex-1 space-y-8">
        
        {/* Revenue Dashboard */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Revenue Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Billed (All Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{formatPaiseToINR(revenueStats.totalBilled)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{formatPaiseToINR(revenueStats.totalCollected)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Outstanding Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatPaiseToINR(revenueStats.totalOutstanding)}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sales & Pipeline */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sales & Pipeline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{salesFunnel.leads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{salesFunnel.activeDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Won Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{salesFunnel.wonDeals}</div>
              </CardContent>
            </Card>
            <Card className="bg-indigo-50 border-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-800">Pipeline Forecast (Weighted)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">{formatPaiseToINR(pipeline.forecast)}</div>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
