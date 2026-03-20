"use client"

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkCard } from "./link-card";
import { reorderLinks } from "./actions";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  order: number;
}

function SortableCard({
  link,
  canEdit,
}: {
  link: LinkItem;
  canEdit: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: canEdit ? "grab" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LinkCard link={link} canEdit={canEdit} />
    </div>
  );
}

export function LinksGrid({
  initialLinks,
  canEdit,
}: {
  initialLinks: LinkItem[];
  canEdit: boolean;
}) {
  const [links, setLinks] = useState(initialLinks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const activeLink = links.find((l) => l.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const newLinks = arrayMove(links, oldIndex, newIndex);

    setLinks(newLinks);
    await reorderLinks(newLinks.map((l) => l.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links.map((l) => l.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <SortableCard key={link.id} link={link} canEdit={canEdit} />
          ))}
          {links.length === 0 && (
            <div className="col-span-full py-12 text-center glass rounded-3xl" style={{ color: "var(--muted)" }}>
              등록된 링크가 없습니다.
            </div>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeLink && (
          <div style={{ opacity: 0.9, transform: "scale(1.03)", cursor: "grabbing" }}>
            <LinkCard link={activeLink} canEdit={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
