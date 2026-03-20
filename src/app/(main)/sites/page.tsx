import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { SitesGrid } from "./sites-grid";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "교내 사이트",
    description: "경남과학고등학교 주요 연계 사이트 모음입니다.",
};

export default async function SitesPage() {
    const [user, sites] = await Promise.all([
        getCurrentUser(),
        prisma.relatedSite.findMany({ orderBy: { order: "asc" } }),
    ]);

    const canEdit = user?.role === "ADMIN";

    return (
        <div className="mobile-page mobile-safe-bottom space-y-12 max-w-6xl mx-auto">
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">교내 연계 사이트</h1>
                <p className="text-slate-500">학교 생활에 필요한 공식 사이트와 커뮤니티를 모았습니다.</p>
            </div>

            <SitesGrid initialSites={sites} canEdit={canEdit} />
        </div>
    );
}
