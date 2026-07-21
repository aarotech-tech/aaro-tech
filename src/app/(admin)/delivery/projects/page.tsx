import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function ProjectsPage() {
  const activeProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      value: projects.value,
      expectedDeliveryDate: projects.expectedDeliveryDate,
      organizationName: organizations.name,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(isNull(projects.deletedAt));

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Active Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage delivery pipelines for won deals.</p>
        </div>
      </div>
      
      <div className="rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No active projects found. Win a deal to create one!
                </TableCell>
              </TableRow>
            ) : (
              activeProjects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-blue-600">
                    <Link href={`/delivery/projects/${p.id}`}>{p.name}</Link>
                  </TableCell>
                  <TableCell>{p.organizationName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.health === 'green' ? 'default' : p.health === 'yellow' ? 'secondary' : 'destructive'} className="capitalize">
                      {p.health}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((p.value || 0) / 100)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
