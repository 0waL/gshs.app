import { prisma } from "@/lib/db";
import { createRelatedSite } from "./actions";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { SitesTable } from "./sites-table";

export default async function AdminSitesPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') redirect("/");

    const sites = await prisma.relatedSite.findMany({
        orderBy: { order: "asc" },
    });

    return (
        <div className="mobile-page mobile-safe-bottom space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">교내 사이트 관리</h1>
                <p className="text-slate-500">교내 연계 사이트 목록을 관리합니다. 드래그하여 순서를 변경할 수 있습니다.</p>
            </div>

            {/* Create Form */}
            <div className="glass p-6 rounded-3xl border-t-4 border-indigo-500">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    새 사이트 추가
                </h3>
                <form action={createRelatedSite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" placeholder="사이트 이름 (예: 학교 홈페이지)" required className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
                    <input name="url" placeholder="URL (예: gshs.kr)" required className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />

                    <select name="category" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <option value="OFFICIAL">학교/기관 (OFFICIAL)</option>
                        <option value="CLUB">동아리 (CLUB)</option>
                        <option value="COMMUNITY">커뮤니티 (COMMUNITY)</option>
                    </select>

                    <input name="description" placeholder="설명 (선택사항)" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />

                    <button className="md:col-span-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                        추가하기
                    </button>
                </form>
            </div>

            {/* Sortable List */}
            <div className="glass rounded-3xl overflow-hidden">
                <SitesTable initialSites={sites} />
            </div>
        </div>
    );
}
