"use client";

import dynamic from "next/dynamic";
import { StationWithWeather } from "@/types/weather";

const DynamicTaiwanMap = dynamic(() => import("./TaiwanWeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-md">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-sky-400 text-xs font-bold">
          GIS
        </div>
      </div>
      <p className="mt-4 text-slate-300 font-medium tracking-wide">正在載入台灣氣象 GIS 圖資與測站數據...</p>
      <p className="text-xs text-slate-500 mt-1">載入 OpenStreetMap 底圖與台灣縣市邊界 GeoJSON</p>
    </div>
  ),
});

interface MapWrapperProps {
  stations: StationWithWeather[];
  selectedCounty: string;
  displayMode: "temp" | "rain" | "wind" | "all";
  selectedStationId?: string | null;
  onSelectStation?: (station: StationWithWeather) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicTaiwanMap {...props} />;
}
