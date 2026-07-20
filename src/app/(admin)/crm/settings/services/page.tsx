import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import AddServiceModal from "./_components/AddServiceModal";

export default async function ServicesPage() {
  const allServices = await db.query.services.findMany({
    orderBy: [desc(services.id)]
  });

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Services Catalog</h2>
          <p className="text-sm text-gray-500 mt-1">Manage standard offerings and base prices.</p>
        </div>
        <AddServiceModal />
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Service Name</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium text-right">Base Price</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allServices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No services configured yet.
                </td>
              </tr>
            ) : (
              allServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{service.description}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">${service.basePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
