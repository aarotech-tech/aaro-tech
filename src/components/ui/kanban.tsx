"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string) => {
    if (columns.find((c) => c.id === id)) {
      return columns.find((c) => c.id === id);
    }
    return columns.find((c) => c.items.find((i) => i.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    setColumns((prev) => {
      const activeItems = activeColumn.items;
      const overItems = overColumn.items;
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      let newIndex;
      if (overId in prev.map((c) => c.id)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const next = [...prev];
      const nextActiveColIndex = next.findIndex((c) => c.id === activeColumn.id);
      const nextOverColIndex = next.findIndex((c) => c.id === overColumn.id);

      next[nextActiveColIndex] = {
        ...next[nextActiveColIndex],
        items: [...next[nextActiveColIndex].items.filter((i) => i.id !== activeId)],
      };
      
      const newOverItems = [...next[nextOverColIndex].items];
      newOverItems.splice(newIndex, 0, activeItems[activeIndex]);
      next[nextOverColIndex] = {
        ...next[nextOverColIndex],
        items: newOverItems,
      };

      return next;
    });
  };

  const handleDragEndEvent = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) {
      return;
    }

    const activeIndex = activeColumn.items.findIndex((i) => i.id === activeId);
    const overIndex = overColumn.items.findIndex((i) => i.id === overId);

    if (activeColumn === overColumn) {
      if (activeIndex !== overIndex) {
        setColumns((prev) => {
          const next = [...prev];
          const colIndex = next.findIndex((c) => c.id === activeColumn.id);
          next[colIndex] = {
            ...next[colIndex],
            items: arrayMove(next[colIndex].items, activeIndex, overIndex),
          };
          return next;
        });
        
        onDragEnd(activeId, activeColumn.id, overColumn.id, overIndex);
      }
    } else {
        // Handled in onDragOver but we trigger action here
        const finalOverIndex = overColumn.items.findIndex((i) => i.id === activeId);
        onDragEnd(activeId, activeColumn.id, overColumn.id, finalOverIndex);
    }
  };

  const activeItem = activeId ? columns.flatMap((c) => c.items).find((i) => i.id === activeId) : null;

  if (!isClient) return <div className="flex gap-4 overflow-x-auto p-4 h-full"><div className="w-80 bg-gray-100 rounded animate-pulse" /></div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEndEvent}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4 pb-12">
        {columns.map((col) => (
          <KanbanColumnContainer 
            key={col.id} 
            column={col} 
            renderItem={renderItem} 
            renderColumnHeader={renderColumnHeader}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <Card className="shadow-lg border-blue-200 cursor-grabbing opacity-80">
            {renderItem(activeItem)}
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumnContainer({ 
  column, 
  renderItem, 
  renderColumnHeader 
}: { 
  column: KanbanColumn; 
  renderItem: (item: KanbanItem) => React.ReactNode;
  renderColumnHeader?: (col: KanbanColumn) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-gray-50 rounded-lg p-3">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        {renderColumnHeader ? renderColumnHeader(column) : (
          <Badge variant="secondary">{column.items.length}</Badge>
        )}
      </div>
      
      <SortableContext 
        id={column.id}
        items={column.items.map((i) => i.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto rounded p-1" style={{ minHeight: "150px" }}>
          {column.items.map((item) => (
            <SortableItem key={item.id} item={item} renderItem={renderItem} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableItem({ item, renderItem }: { item: KanbanItem; renderItem: (item: KanbanItem) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab hover:cursor-grab active:cursor-grabbing">
      <Card className="shadow-sm border-gray-200">
        {renderItem(item)}
      </Card>
    </div>
  );
}
