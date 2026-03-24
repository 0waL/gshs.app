"use client"

import { useState, useEffect } from "react";
import { getSystemLogs } from "./actions";
import { Loader2, ChevronLeft, ChevronRight, Search, Eye, X } from "lucide-react";
import { format } from "date-fns";

export function LogViewer() {
    const [logs, setLogs] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL");
    const [filterRole, setFilterRole] = useState("ALL");
    const [searchUser, setSearchUser] = useState("");
    const [selectedLog, setSelectedLog] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, filterType, filterRole, searchUser]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getSystemLogs(page, 15, filterType, searchUser, filterRole);
            setLogs(data.logs);
            setTotalPage(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const actionTypes = ["ALL", "LOGIN", "LOGOUT", "PAGE_VIEW", "SONG_REQUEST", "ADMIN_ACTION", "ERROR"];
    const roles = [
        { label: "전체 역할", value: "ALL" },
        { label: "학생", value: "STUDENT" },
        { label: "교사", value: "TEACHER" },
        { label: "관리자", value: "ADMIN" },
        { label: "방송부", value: "BROADCAST" }
    ];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
            >
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Search User */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: "var(--muted)" }} />
                        <input
                            type="text"
                            placeholder="이름/학번 검색..."
                            value={searchUser}
                            onChange={(e) => {
                                setSearchUser(e.target.value);
                                setPage(1);
                            }}
                            className="text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none w-full md:w-48"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={filterRole}
                        onChange={(e) => {
                            setFilterRole(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                        {roles.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold hidden md:inline" style={{ color: "var(--muted)" }}>|</span>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setPage(1);
                            }}
                            className="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                        >
                            {actionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
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
                                <th className="px-6 py-4 font-medium">Time</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Path / IP</th>
                                <th className="px-6 py-4 font-medium text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y" style={{ borderColor: "var(--border)" }}>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: "var(--muted)" }}>
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <p>불러오는 중...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: "var(--muted)" }}>
                                        기록된 로그가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: "var(--muted)" }}>
                                            {format(new Date(log.createdAt), "MM.dd HH:mm:ss")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                ${log.action === 'ERROR' ? 'bg-rose-500/10 text-rose-500' :
                                                    log.action === 'LOGIN' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        log.action === 'ADMIN_ACTION' ? 'bg-amber-500/10 text-amber-500' :
                                                            ''}`}
                                                style={!['ERROR','LOGIN','ADMIN_ACTION'].includes(log.action)
                                                    ? { backgroundColor: "color-mix(in srgb, var(--muted) 12%, transparent)", color: "var(--muted)" }
                                                    : undefined}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium" style={{ color: "var(--foreground)" }}>{log.user?.name || "Guest"}</span>
                                                <span className="text-xs" style={{ color: "var(--muted)" }}>{log.user?.studentId || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex flex-col truncate">
                                                <span className="truncate" style={{ color: "var(--foreground)" }} title={log.path}>{log.path || "-"}</span>
                                                <span className="text-xs" style={{ color: "var(--muted)" }}>{log.ip}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="btn-semantic p-2 rounded-lg transition-colors"
                                                style={{ color: "var(--accent)" }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4"
                        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Log Details</h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="btn-semantic p-1 rounded-lg"
                                style={{ color: "var(--muted)" }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>Time</label>
                                <p className="font-mono" style={{ color: "var(--foreground)" }}>
                                    {format(new Date(selectedLog.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>Action</label>
                                <p className="font-mono" style={{ color: "var(--foreground)" }}>{selectedLog.action}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>User</label>
                                <p style={{ color: "var(--foreground)" }}>
                                    {selectedLog.user?.name} ({selectedLog.user?.studentId || "N/A"})
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>IP Address</label>
                                <p className="font-mono" style={{ color: "var(--foreground)" }}>{selectedLog.ip}</p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>Path</label>
                                <p
                                    className="font-mono break-all p-2 rounded text-sm"
                                    style={{ backgroundColor: "var(--surface-2)", color: "var(--foreground)" }}
                                >
                                    {selectedLog.path}
                                </p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs" style={{ color: "var(--muted)" }}>Details (JSON)</label>
                                <pre
                                    className="p-4 rounded-lg text-xs font-mono text-emerald-500 overflow-x-auto max-h-60"
                                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
                                >
                                    {tryFormatJson(selectedLog.details)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function tryFormatJson(str: string | null) {
    if (!str) return "No details";
    try {
        return JSON.stringify(JSON.parse(str), null, 2);
    } catch (e) {
        return str;
    }
}
