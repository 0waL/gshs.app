import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Link as LinkIcon } from "lucide-react";
import { LinkCard } from "./link-card";
import { AddLinkModal } from "./add-link-modal";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "바로가기",
  description: "학교 생활에 유용한 웹사이트 바로가기 모음입니다.",
};

export default async function LinksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canEdit = user.role === 'TEACHER' || user.role === 'ADMIN';

  const links = await prisma.linkItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mobile-page mobile-safe-bottom space-y-8">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}>
                <LinkIcon className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold">바로가기 모음</h1>
                <p style={{ color: "var(--muted)" }}>유용한 사이트 링크를 모아두었습니다.</p>
             </div>
          </div>
          {canEdit && <AddLinkModal />}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, i) => (
             <LinkCard key={link.id} link={link} canEdit={canEdit} isFirst={i === 0} isLast={i === links.length - 1} />
          ))}
          
          {links.length === 0 && (
              <div className="col-span-full py-12 text-center glass rounded-3xl" style={{ color: "var(--muted)" }}>
                  등록된 링크가 없습니다.
              </div>
          )}
       </div>

    </div>
  )
}