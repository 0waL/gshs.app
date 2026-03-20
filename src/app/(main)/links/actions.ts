"use server"

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createLink(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  let url = formData.get("url") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  const maxOrder = await prisma.linkItem.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  await prisma.linkItem.create({
    data: {
      title,
      url,
      description,
      category,
      order: nextOrder,
    },
  });

  revalidatePath("/links");
}

export async function updateLink(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  let url = formData.get("url") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  await prisma.linkItem.update({
    where: { id },
    data: {
      title,
      url,
      description,
      category,
    },
  });

  revalidatePath("/links");
}

export async function reorderLinks(orderedIds: string[]) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.linkItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/links");
}

export async function moveLink(id: string, direction: "up" | "down") {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    throw new Error("Unauthorized");
  }

  const all = await prisma.linkItem.findMany({ orderBy: { order: "asc" } });
  const idx = all.findIndex((l) => l.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;

  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];

  await prisma.$transaction([
    prisma.linkItem.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.linkItem.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/links");
}

export async function deleteLink(formData: FormData) {
  const id = formData.get("id") as string;
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      throw new Error("Unauthorized");
  }

  await prisma.linkItem.delete({ where: { id } });
  revalidatePath("/links");
}