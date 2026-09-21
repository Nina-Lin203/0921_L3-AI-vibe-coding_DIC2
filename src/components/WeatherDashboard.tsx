"use client";

import React, { useState } from "react";
import { StationWithWeather } from "@/types/weather";
import Header from "./Header";
import StatsCards from "./StatsCards";
import ControlPanel from "./ControlPanel";
import MapWrapper from "./MapWrapper";

interface WeatherDashboardProps {
  initialStations: StationWithWeather[];
}

export default function WeatherDashboard({ initialStations }: WeatherDashboardProps) {
  const [stations, setStations] = useState<StationWithWeather[]>(initialStations);
  const [selectedCounty, setSelectedCounty] = useState<string>("ALL");
  const [displayMode, setDisplayMode] = useState<"temp" | "rain" | "wind" | "all">("temp");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Find latest observation time
  const latestObsTime = stations.find((s) => s.obsTime)?.obsTime || undefined;

  // Handle station selection
  const handleSelectStation = (station: StationWithWeather) => {
    setSelectedStationId(station.stationId);
    if (selectedCounty !== "ALL" && !station.countyName.includes(selectedCounty)) {
      setSelectedCounty("ALL");
    }
  };

  // Handle live data refresh from CWA API
  const handleRefresh = async () => {
    const res = await fetch("/api/weather", { method: "POST" });
    if (!res.ok) {
      throw new Error(`Refresh failed: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.success) {
      // Re-fetch updated list from GET endpoint
      const getRes = await fetch("/api/weather");
      const getData = await getRes.json();
      if (getData.success && Array.isArray(getData.data)) {
        setStations(getData.data);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        stationCount={stations.length}
        lastUpdated={latestObsTime}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
        {/* Extreme Weather Statistics Cards */}
        <StatsCards stations={stations} onSelectStation={handleSelectStation} />

        {/* Filter and Control Bar */}
        <ControlPanel
          stations={stations}
          selectedCounty={selectedCounty}
          onChangeCounty={setSelectedCounty}
          displayMode={displayMode}
          onChangeDisplayMode={setDisplayMode}
          onSelectStation={handleSelectStation}
        />

        {/* GIS Map Container */}
        <div className="flex-1 w-full min-h-[620px] rounded-2xl overflow-hidden shadow-2xl relative">
          <MapWrapper
            stations={stations}
            selectedCounty={selectedCounty}
            displayMode={displayMode}
            selectedStationId={selectedStationId}
            onSelectStation={handleSelectStation}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900/60 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>
          台灣氣象 GIS 視覺化系統 • 資料來源：
          <a
            href="https://opendata.cwa.gov.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline ml-1"
          >
            交通部中央氣象署 (CWA Open Data)
          </a>
          {" "}• OpenStreetMap & CARTO 底圖
        </p>
      </footer>
    </div>
  );
}
