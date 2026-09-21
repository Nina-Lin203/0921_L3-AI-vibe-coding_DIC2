"use client";

import React, { useState, useMemo } from "react";
import { StationWithWeather } from "@/types/weather";
import { Search, MapPin, Thermometer, CloudRain, Wind, Layers, Info } from "lucide-react";

const TAIWAN_COUNTIES = [
  "ALL",
  "基隆市",
  "臺北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "臺中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "臺南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

interface ControlPanelProps {
  stations: StationWithWeather[];
  selectedCounty: string;
  onChangeCounty: (county: string) => void;
  displayMode: "temp" | "rain" | "wind" | "all";
  onChangeDisplayMode: (mode: "temp" | "rain" | "wind" | "all") => void;
  onSelectStation: (station: StationWithWeather) => void;
}

export default function ControlPanel({
  stations,
  selectedCounty,
  onChangeCounty,
  displayMode,
  onChangeDisplayMode,
  onSelectStation,
}: ControlPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return stations
      .filter(
        (s) =>
          s.stationName.toLowerCase().includes(query) ||
          s.countyName.toLowerCase().includes(query) ||
          s.townName.toLowerCase().includes(query) ||
          s.stationId.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [stations, searchQuery]);

  return (
    <div className="flex flex-col gap-3 w-full bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Metric Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => onChangeDisplayMode("temp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              displayMode === "temp"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span>氣溫分佈</span>
          </button>

          <button
            onClick={() => onChangeDisplayMode("rain")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              displayMode === "rain"
                ? "bg-blue-500/20 text-sky-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>時降雨量</span>
          </button>

          <button
            onClick={() => onChangeDisplayMode("wind")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              displayMode === "wind"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>即時風速</span>
          </button>

          <button
            onClick={() => onChangeDisplayMode("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              displayMode === "all"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>全部測站</span>
          </button>
        </div>

        {/* County Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          {/* County Selector */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedCounty}
              onChange={(e) => onChangeCounty(e.target.value)}
              className="w-full appearance-none bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">全台灣（所有縣市）</option>
              {TAIWAN_COUNTIES.filter((c) => c !== "ALL").map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-sky-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Station Quick Search */}
          <div className="relative w-full sm:w-60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="搜尋測站名稱、鄉鎮或 ID..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsSearchOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {searchResults.map((station) => (
                    <button
                      key={station.stationId}
                      onClick={() => {
                        onSelectStation(station);
                        setSearchQuery(station.stationName);
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-100 group-hover:text-sky-300">
                          {station.stationName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {station.countyName} {station.townName} • ID: {station.stationId}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-orange-400">
                          {station.airTemperature !== null ? `${station.airTemperature.toFixed(1)}°C` : ""}
                        </span>
                        {station.precipitation !== null && station.precipitation > 0 && (
                          <span className="block text-[10px] text-sky-400 font-semibold">
                            {station.precipitation.toFixed(1)} mm
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Color Scale Legend */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>圖例說明：</span>
        </div>

        {displayMode === "temp" || displayMode === "all" ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span> &lt;15°C 寒冷
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> 15-20°C 涼爽
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> 20-25°C 舒適
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span> 25-28°C 溫暖
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span> 28-32°C 炎熱
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span> &gt;32°C 酷熱
            </span>
          </div>
        ) : displayMode === "rain" ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] border border-slate-600"></span> 0 mm 無雨
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> 0-2 mm 微雨
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span> 2-10 mm 小雨
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]"></span> 10-30 mm 大雨
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#db2777]"></span> &gt;30 mm 豪雨
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0891b2]"></span> 測站風速 (m/s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
