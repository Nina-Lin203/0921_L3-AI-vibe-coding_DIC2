"use client";

import React, { useMemo } from "react";
import { StationWithWeather } from "@/types/weather";
import { ThermometerSun, Snowflake, CloudRain, Wind, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stations: StationWithWeather[];
  onSelectStation: (station: StationWithWeather) => void;
}

export default function StatsCards({ stations, onSelectStation }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (stations.length === 0) return null;

    let maxTempStation: StationWithWeather | null = null;
    let minTempStation: StationWithWeather | null = null;
    let maxRainStation: StationWithWeather | null = null;
    let maxWindStation: StationWithWeather | null = null;

    for (const s of stations) {
      // Temp
      if (s.airTemperature !== null) {
        if (!maxTempStation || (maxTempStation.airTemperature !== null && s.airTemperature > maxTempStation.airTemperature)) {
          maxTempStation = s;
        }
        if (!minTempStation || (minTempStation.airTemperature !== null && s.airTemperature < minTempStation.airTemperature)) {
          minTempStation = s;
        }
      }

      // Rain
      if (s.precipitation !== null && s.precipitation > 0) {
        if (!maxRainStation || (maxRainStation.precipitation !== null && s.precipitation > maxRainStation.precipitation)) {
          maxRainStation = s;
        }
      }

      // Wind
      if (s.windSpeed !== null && s.windSpeed > 0) {
        if (!maxWindStation || (maxWindStation.windSpeed !== null && s.windSpeed > maxWindStation.windSpeed)) {
          maxWindStation = s;
        }
      }
    }

    return { maxTempStation, minTempStation, maxRainStation, maxWindStation };
  }, [stations]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {/* Highest Temperature */}
      {stats.maxTempStation && (
        <button
          onClick={() => onSelectStation(stats.maxTempStation!)}
          className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 transition-all duration-200 shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">全台最高溫</span>
            <div className="p-1 rounded-md bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
              <ThermometerSun className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-orange-300">
              {stats.maxTempStation.airTemperature?.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-300 truncate">
              {stats.maxTempStation.stationName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {stats.maxTempStation.countyName} {stats.maxTempStation.townName}
          </p>
        </button>
      )}

      {/* Lowest Temperature */}
      {stats.minTempStation && (
        <button
          onClick={() => onSelectStation(stats.minTempStation!)}
          className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 transition-all duration-200 shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">全台最低溫</span>
            <div className="p-1 rounded-md bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <Snowflake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-sky-300">
              {stats.minTempStation.airTemperature?.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-300 truncate">
              {stats.minTempStation.stationName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {stats.minTempStation.countyName} {stats.minTempStation.townName}
          </p>
        </button>
      )}

      {/* Maximum Rainfall */}
      <button
        onClick={() => stats.maxRainStation && onSelectStation(stats.maxRainStation)}
        disabled={!stats.maxRainStation}
        className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-md group cursor-pointer disabled:opacity-60"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 font-medium">最大時降雨</span>
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
            <CloudRain className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-cyan-300">
            {stats.maxRainStation ? `${stats.maxRainStation.precipitation?.toFixed(1)} mm` : "0.0 mm"}
          </span>
          <span className="text-xs text-slate-300 truncate">
            {stats.maxRainStation ? stats.maxRainStation.stationName : "全台無顯著雨勢"}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          {stats.maxRainStation ? `${stats.maxRainStation.countyName} ${stats.maxRainStation.townName}` : "天氣晴朗穩定"}
        </p>
      </button>

      {/* Maximum Wind Speed */}
      {stats.maxWindStation && (
        <button
          onClick={() => onSelectStation(stats.maxWindStation!)}
          className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">全台最強風速</span>
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Wind className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-300">
              {stats.maxWindStation.windSpeed?.toFixed(1)} m/s
            </span>
            <span className="text-xs text-slate-300 truncate">
              {stats.maxWindStation.stationName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {stats.maxWindStation.countyName} {stats.maxWindStation.townName}
          </p>
        </button>
      )}
    </div>
  );
}
