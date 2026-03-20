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
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="px-3 py-4">
        <button
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-6 py-4 font-medium">
        <div>{site.name}</div>
        <div className="text-xs text-slate-400">{site.description}</div>
      </td>
      <td className="px-6 py-4 text-blue-500 underline truncate max-w-[200px]">
        <a href={site.url} target="_blank" rel="noreferrer">{site.url}</a>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
          {site.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <EditSiteButton site={{ id: site.id, name: site.name, url: site.url, description: site.description }} />
          <form action={deleteRelatedSite}>
            <input type="hidden" name="id" value={site.id} />
            <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </td>
    </tr>
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sites.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-3 py-4 w-10"></th>
              <th className="px-6 py-4">이름</th>
              <th className="px-6 py-4">URL</th>
              <th className="px-6 py-4">카테고리</th>
              <th className="px-6 py-4">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sites.map((site) => (
              <SortableRow key={site.id} site={site} />
            ))}
            {sites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  등록된 사이트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SortableContext>
    </DndContext>
  );
}
