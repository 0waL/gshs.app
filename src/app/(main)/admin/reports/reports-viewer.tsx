"use client"

import { useState, useEffect } from "react";
import { getErrorReports, updateReportStatus } from "./actions";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Eye, X, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function ReportsViewer() {
    const [reports, setReports] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [modalTab, setModalTab] = useState<"details" | "update">("details");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await getErrorReports(page, 15, filterStatus);
            setReports(data.reports);
            setTotalPage(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page, filterStatus]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateReportStatus(id, newStatus);
            fetchReports();
            setSelectedReport(null);
        } catch (error) {
            console.error(error);
        }
    };

    const statuses = [
        { label: "전체", value: "ALL" },
        { label: "대기중", value: "PENDING" },
        { label: "검토중", value: "REVIEWING" },
        { label: "해결됨", value: "RESOLVED" }
    ];

    const getStatusBadge = (status: string) => {
        if (status === "PENDING") return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30", icon: Clock };
        if (status === "REVIEWING") return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30", icon: AlertCircle };
        if (status === "RESOLVED") return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30", icon: CheckCircle };
        return { bg: "bg-slate-500/10", text: "", border: "", icon: AlertCircle };
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>상태:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                        {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" style={{ color: "var(--muted)" }} />
                    </button>
                    <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                        {page} / {totalPage || 1}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPage, p + 1))}
                        disabled={page === totalPage || loading}
                        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" style={{ color: "var(--muted)" }} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className="border-b text-xs uppercase tracking-wider"
                                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--muted)" }}
                            >
                                <th className="px-6 py-4 font-medium">시간</th>
                                <th className="px-6 py-4 font-medium">제목</th>
                                <th className="px-6 py-4 font-medium">사용자</th>
                                <th className="px-6 py-4 font-medium">상태</th>
                                <th className="px-6 py-4 font-medium text-right">작업</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y" style={{ borderColor: "var(--border)" }}>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: "var(--muted)" }}>
                                        불러오는 중...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: "var(--muted)" }}>
                                        신고된 오류가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => {
                                    const StatusIcon = getStatusBadge(report.status).icon;
                                    return (
                                        <tr key={report.id} className="transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap" style={{ color: "var(--muted)" }}>
                                                {format(new Date(report.createdAt), "MM.dd HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate font-medium" style={{ color: "var(--foreground)" }}>
                                                {report.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium" style={{ color: "var(--foreground)" }}>{report.user?.name || "Unknown"}</span>
                                                    <span className="text-xs" style={{ color: "var(--muted)" }}>{report.user?.studentId || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(report.status).bg} ${getStatusBadge(report.status).text} ${getStatusBadge(report.status).border}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statuses.find(s => s.value === report.status)?.label || report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setModalTab("details");
                                                    }}
                                                    className="btn-semantic p-2 rounded-lg transition-colors"
                                                    style={{ color: "var(--accent)" }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4"
                        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>오류 신고 상세</h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="btn-semantic p-1 rounded-lg"
                                style={{ color: "var(--muted)" }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
                            <button
                                onClick={() => setModalTab("details")}
                                className={`btn-semantic px-4 py-2 text-sm font-medium transition-colors ${modalTab === "details" ? "border-b-2 border-current" : ""}`}
                                style={{ color: modalTab === "details" ? "var(--accent)" : "var(--muted)" }}
                            >
                                상세 정보
                            </button>
                            <button
                                onClick={() => setModalTab("update")}
                                className={`btn-semantic px-4 py-2 text-sm font-medium transition-colors ${modalTab === "update" ? "border-b-2 border-current" : ""}`}
                                style={{ color: modalTab === "update" ? "var(--accent)" : "var(--muted)" }}
                            >
                                상태 변경
                            </button>
                        </div>

                        {modalTab === "details" ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs" style={{ color: "var(--muted)" }}>제목</label>
                                    <p className="font-medium" style={{ color: "var(--foreground)" }}>{selectedReport.title}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs" style={{ color: "var(--muted)" }}>신고자</label>
                                    <p style={{ color: "var(--foreground)" }}>{selectedReport.user?.name} ({selectedReport.user?.studentId})</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs" style={{ color: "var(--muted)" }}>신고 시간</label>
                                    <p className="font-mono" style={{ color: "var(--foreground)" }}>{format(new Date(selectedReport.createdAt), "yyyy-MM-dd HH:mm:ss")}</p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs" style={{ color: "var(--muted)" }}>내용</label>
                                    <div
                                        className="p-4 rounded-lg whitespace-pre-wrap break-words max-h-60 overflow-y-auto text-sm"
                                        style={{ backgroundColor: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                                    >
                                        {selectedReport.content}
                                    </div>
                                </div>
                                {selectedReport.adminNotes && (
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs" style={{ color: "var(--muted)" }}>관리자 메모</label>
                                        <div
                                            className="p-4 rounded-lg whitespace-pre-wrap text-sm"
                                            style={{ backgroundColor: "var(--surface-2)", color: "var(--muted)" }}
                                        >
                                            {selectedReport.adminNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedReport.id, "PENDING")}
                                        className="btn-semantic flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        대기중으로 변경
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedReport.id, "REVIEWING")}
                                        className="btn-semantic flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        검토중으로 변경
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleStatusUpdate(selectedReport.id, "RESOLVED")}
                                    className="btn-semantic w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    해결됨으로 변경
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
