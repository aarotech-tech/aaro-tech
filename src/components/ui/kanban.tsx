"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface KanbanItem {
  id: string;
  [key: string]: any;
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  initialColumns: KanbanColumn[];
  onDragEnd: (itemId: string, sourceColId: string, destColId: string, newIndex: number) => void;
  renderItem: (item: KanbanItem) => React.ReactNode;
  renderColumnHeader?: (col: KanbanColumn) => React.ReactNode;
}

export function KanbanBoard({ initialColumns, onDragEnd, renderItem, renderColumnHeader }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setColumns(initialColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialColumns]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newColumns = Array.from(columns);
    const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId);
    const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId);

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    const sourceItems = Array.from(sourceCol.items);
    const destItems = source.droppableId === destination.droppableId ? sourceItems : Array.from(destCol.items);

    const [movedItem] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedItem);

    if (source.droppableId === destination.droppableId) {
      newColumns[sourceColIndex] = { ...sourceCol, items: sourceItems };
    } else {
      newColumns[sourceColIndex] = { ...sourceCol, items: sourceItems };
      newColumns[destColIndex] = { ...destCol, items: destItems };
    }

    // Optimistic UI Update
    setColumns(newColumns);

    // Trigger server action
    onDragEnd(draggableId, source.droppableId, destination.droppableId, destination.index);
  };

  if (!isClient) return <div className="flex gap-4 overflow-x-auto p-4 h-full"><div className="w-80 bg-gray-100 rounded animate-pulse" /></div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-4 pb-12">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col w-80 flex-shrink-0 bg-gray-50 rounded-lg p-3">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">{column.title}</h3>
              {renderColumnHeader ? renderColumnHeader(column) : (
                <Badge variant="secondary">{column.items.length}</Badge>
              )}
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto rounded p-1 transition-colors ${
                    snapshot.isDraggingOver ? "bg-gray-200/50" : ""
                  }`}
                  style={{ minHeight: "150px" }}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3"
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <Card className="shadow-sm border-gray-200">
                            {renderItem(item)}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
