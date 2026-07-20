"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateDealStage } from "../actions";

const COLUMNS = [
  { id: "discovery", title: "Discovery" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal Sent" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
];

export type Deal = {
  id: string;
  name: string;
  value: number | null;
  stage: string | null;
  organizationName: string | null;
};

export default function KanbanBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals);

  // A small hack for React 18 strict mode with hello-pangea/dnd
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStage = destination.droppableId;

    // Optimistic UI update
    const updatedDeals = deals.map(deal =>
      deal.id === draggableId ? { ...deal, stage: newStage } : deal
    );
    setDeals(updatedDeals);

    // Update DB
    await updateDealStage(draggableId, newStage);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnDeals = deals.filter((d) => d.stage === column.id);

          return (
            <div key={column.id} className="flex-shrink-0 w-80 bg-gray-100/50 rounded-lg flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <span className="text-xs text-gray-500">{columnDeals.length} Deals</span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? "bg-gray-100" : ""
                      }`}
                  >
                    {columnDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 bg-white border rounded shadow-sm flex flex-col gap-2 transition-shadow ${snapshot.isDragging ? "shadow-md ring-2 ring-blue-500/20" : "border-gray-200 hover:shadow-md"
                              }`}
                          >
                            <div className="font-medium text-gray-900">{deal.name}</div>
                            <div className="text-sm text-gray-500">{deal.organizationName}</div>
                            <div className="text-sm font-semibold text-green-600 mt-1 flex justify-between items-center">
                              <span>${deal.value?.toLocaleString()}</span>
                              {deal.stage === "proposal" && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const { generateProposal } = await import("../actions");
                                    const res = await generateProposal(deal.id);
                                    if (res.success && res.data?.proposalId) {
                                      window.location.href = `/crm/proposals/${res.data.proposalId}`;
                                    }
                                  }}
                                  className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                >
                                  Generate
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
