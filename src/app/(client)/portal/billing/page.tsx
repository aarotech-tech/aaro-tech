import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { financeService } from "@/modules/finance/services";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientBillingPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const orgId = membershipData.myOrg.id;
  const [invoices, payments] = await Promise.all([
    financeService.getClientInvoices(orgId),
    financeService.getClientPayments(orgId)
  ]);

  const outstandingInvoices = invoices.filter(i => i.status === "issued");
  const paidInvoices = invoices.filter(i => i.status === "paid");

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Billing & Invoices"
          description="Manage your outstanding balances and view payment history."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Billing" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-50">
            <CardTitle className="text-lg flex items-center text-emerald-900">
              <CreditCard className="w-5 h-5 mr-2" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {outstandingInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">You have no outstanding invoices.</p>
            ) : (
              <div className="space-y-4">
                {outstandingInvoices.map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.number}</p>
                      <p className="text-sm text-gray-500 mt-1">Due: {new Date(invoice.dueAt as string).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="font-bold text-lg text-emerald-700">${(invoice.amountCents / 100).toFixed(2)}</span>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 w-full">Pay Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center text-gray-900">
              <Receipt className="w-5 h-5 mr-2" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {paidInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No payment history available.</p>
            ) : (
              <div className="space-y-4">
                {paidInvoices.map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center p-4 border border-gray-100 bg-gray-50/30 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.number}</p>
                      <p className="text-xs text-gray-500 mt-1">Paid on: {new Date(invoice.paidAt as string).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-600">${(invoice.amountCents / 100).toFixed(2)}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
