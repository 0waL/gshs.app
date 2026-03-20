import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Link as LinkIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { AddLinkModal } from "./add-link-modal";

const LinksGrid = dynamic(() => import("./links-grid").then((m) => m.LinksGrid), { ssr: false });
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

       <LinksGrid initialLinks={links} canEdit={canEdit} />

    </div>
  )
}