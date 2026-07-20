"use client";

import { useState } from "react";
import { createDeliverableAction } from "@/app/(admin)/crm/deliverables/actions";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default function DeliverablesList({ 
  projectId, 
  retainerPeriodId, 
  deliverables 
}: { 
  projectId?: string, 
  retainerPeriodId?: string, 
  deliverables: any[] 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name) return;
    setIsCreating(true);
    await createDeliverableAction({ name, projectId, retainerPeriodId });
    setName("");
    setIsCreating(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Deliverables</h3>
      </div>

      <div className="space-y-4 mb-6">
        {deliverables.length === 0 ? (
          <p className="text-sm text-gray-500">No deliverables yet.</p>
        ) : (
          deliverables.map(d => (
            <div key={d.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:border-indigo-300 transition-colors">
              <div>
                <h4 className="font-semibold text-gray-900">{d.name}</h4>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{d.status}</p>
              </div>
              <Link href={`/crm/deliverables/${d.id}`} className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded hover:bg-indigo-100">
                Manage
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 pt-4 flex gap-2">
        <input 
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New deliverable name..." 
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={handleCreate}
          disabled={isCreating || !name}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add
        </button>
      </div>
    </div>
  );
}
