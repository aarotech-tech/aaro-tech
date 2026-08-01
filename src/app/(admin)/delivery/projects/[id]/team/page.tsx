import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getProjectMembers } from "@/modules/delivery/services";
import { AssignMemberDialog } from "./_components/AssignMemberDialog";
import { RemoveMemberDialog } from "./_components/RemoveMemberDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectMembers = await getProjectMembers(id);
  
  // Available internal users
  const internalUsers = await db.query.users.findMany({
    where: eq(users.userType, "internal")
  });

  const memberIds = new Set(projectMembers.map(m => m.userId));
  const availableUsers = internalUsers.filter(u => !memberIds.has(u.id));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Team</h2>
          <p className="text-sm text-gray-500">Manage internal team members assigned to this project.</p>
        </div>
        <AssignMemberDialog projectId={id} availableUsers={availableUsers}>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" /> Assign Member
          </Button>
        </AssignMemberDialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {projectMembers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectMembers.map((member) => (
                <tr key={member.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3">
                        {member.user?.firstName?.[0] || <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={member.role === 'lead' ? 'default' : 'secondary'} className="capitalize">
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <RemoveMemberDialog projectId={id} userId={member.userId} userName={`${member.user?.firstName} ${member.user?.lastName}`}>
                      <Button variant="ghost" size="sm" className="text-red-600 h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </RemoveMemberDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No team members assigned yet.</p>
            <p className="text-sm mt-1">Assign members to collaborate on this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
