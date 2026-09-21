"use client";

import React, { useState } from "react";
import { RefreshCw, MapPin, Radio, Activity, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  stationCount: number;
  lastUpdated?: string;
  onRefresh: () => Promise<void>;
}

export default function Header({ stationCount, lastUpdated, onRefresh }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshSuccess(false);
      await onRefresh();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                台灣即時氣象 GIS 視覺化系統
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              中央氣象署 CWA Open API 即時連線 • 自動氣象站觀測網絡
            </p>
          </div>
        </div>

        {/* Status badges and actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>測站總數：</span>
            <strong className="text-sky-300 font-semibold">{stationCount} 站</strong>
            {lastUpdated && (
              <span className="text-slate-500 ml-1 border-l border-slate-700 pl-2">
                更新於 {new Date(lastUpdated).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-200" : ""}`} />
            <span>{isRefreshing ? "同步更新中..." : refreshSuccess ? "同步成功！" : "即時同步 CWA"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
