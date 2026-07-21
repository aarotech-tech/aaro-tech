"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  { id: "discovery", title: "Discovery" },
  { id: "proposal", title: "Proposal Sent" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
];

export function KanbanBoard({ initialLeads, initialDeals }: { initialLeads: any[], initialDeals: any[] }) {
  const [deals, setDeals] = useState(initialDeals);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Local optimistic update
    const newDeals = Array.from(deals);
    const draggedDeal = newDeals.find(d => d.id === result.draggableId);
    if (draggedDeal) {
      draggedDeal.stage = destination.droppableId;
      setDeals([...newDeals]);
      // TODO: Call server action to update deal stage in DB
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          
          return (
            <div key={stage.id} className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-xl p-3 border">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm">{stage.title}</h3>
                <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 flex flex-col gap-3 min-h-[150px]"
                  >
                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <Card 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-md ring-1 ring-primary/20' : 'hover:shadow-md'}`}
                          >
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm font-medium">{deal.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 text-xs text-muted-foreground flex justify-between">
                              <span>${(deal.value / 100).toLocaleString()}</span>
                              <span>{deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : ''}</span>
                            </CardContent>
                          </Card>
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
