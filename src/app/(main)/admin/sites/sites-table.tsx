"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { EditSiteButton } from "./edit-site-modal";
import { deleteRelatedSite, reorderRelatedSites } from "./actions";

interface Site {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string | null;
}

function SortableRow({ site }: { site: Site }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: site.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-sm"
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none flex-shrink-0 p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{site.name}</div>
        {site.description && (
          <div className="text-xs text-slate-400 truncate">{site.description}</div>
        )}
      </div>

      {/* URL */}
      <div className="w-40 hidden md:block">
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 underline text-xs truncate block"
        >
          {site.url}
        </a>
      </div>

      {/* Category */}
      <div className="w-28 hidden sm:block">
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
          {site.category}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <EditSiteButton site={{ id: site.id, name: site.name, url: site.url, description: site.description }} />
        <form action={deleteRelatedSite}>
          <input type="hidden" name="id" value={site.id} />
          <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function SitesTable({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sites.findIndex((s) => s.id === active.id);
    const newIndex = sites.findIndex((s) => s.id === over.id);
    const newSites = arrayMove(sites, oldIndex, newIndex);

    setSites(newSites);
    await reorderRelatedSites(newSites.map((s) => s.id));
  }

  if (sites.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-slate-400">
        등록된 사이트가 없습니다.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sites.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-sm border-b border-slate-100 dark:border-slate-800">
          <div className="w-6 flex-shrink-0" />
          <div className="flex-1">이름</div>
          <div className="w-40 hidden md:block">URL</div>
          <div className="w-28 hidden sm:block">카테고리</div>
          <div className="w-20">관리</div>
        </div>
        {sites.map((site) => (
          <SortableRow key={site.id} site={site} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
