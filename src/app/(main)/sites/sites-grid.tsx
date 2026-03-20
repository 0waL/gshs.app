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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown, Check, ExternalLink, GripVertical } from "lucide-react";
import { reorderRelatedSites } from "../admin/sites/actions";

interface Site {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string | null;
}

function SiteCard({ site, isReordering }: { site: Site; isReordering: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: site.id, disabled: !isReordering });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (isReordering) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="glass p-5 rounded-2xl flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        {...attributes}
        {...listeners}
      >
        <div className="min-w-0">
          <div className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{site.name}</div>
          {site.description && (
            <div className="text-sm text-slate-500 mt-1 truncate">{site.description}</div>
          )}
        </div>
        <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0 ml-3" />
      </div>
    );
  }

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass p-5 rounded-2xl flex items-start justify-between group hover:border-indigo-500/50 transition-all hover:-translate-y-1"
    >
      <div>
        <div className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {site.name}
        </div>
        {site.description && (
          <div className="text-sm text-slate-500 mt-1">{site.description}</div>
        )}
      </div>
      <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1" />
    </a>
  );
}

const CATEGORY_CONFIG = [
  { key: "OFFICIAL", label: "학교/기관" },
  { key: "CLUB", label: "동아리/학생활동" },
  { key: "COMMUNITY", label: "커뮤니티/기타" },
];

export function SitesGrid({ initialSites, canEdit }: { initialSites: Site[]; canEdit: boolean }) {
  const [sites, setSites] = useState(initialSites);
  const [isReordering, setIsReordering] = useState(false);

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
      <div className="text-center py-20 text-slate-500 glass rounded-3xl">
        등록된 사이트가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {canEdit && (
        <div className="flex justify-end">
          {isReordering ? (
            <button
              onClick={() => setIsReordering(false)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              완료
            </button>
          ) : (
            <button
              onClick={() => setIsReordering(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              순서 변경
            </button>
          )}
        </div>
      )}

      {isReordering ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sites.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <SiteCard key={site.id} site={site} isReordering={true} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-12">
          {CATEGORY_CONFIG.map(({ key, label }) => {
            const items = sites.filter((s) => s.category === key);
            if (items.length === 0) return null;
            return (
              <div key={key} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((site) => (
                    <SiteCard key={site.id} site={site} isReordering={false} />
                  ))}
                </div>
              </div>
            );
          })}
          {/* Sites with unknown category */}
          {(() => {
            const others = sites.filter((s) => !["OFFICIAL", "CLUB", "COMMUNITY"].includes(s.category));
            if (others.length === 0) return null;
            return (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">기타</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {others.map((site) => (
                    <SiteCard key={site.id} site={site} isReordering={false} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
