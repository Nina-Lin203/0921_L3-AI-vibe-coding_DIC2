"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection, Geometry } from "geojson";
import { StationWithWeather } from "@/types/weather";
import {
  Thermometer,
  CloudRain,
  Wind,
  Gauge,
  Clock,
  Compass,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface TaiwanWeatherMapProps {
  stations: StationWithWeather[];
  selectedCounty: string;
  displayMode: "temp" | "rain" | "wind" | "all";
  selectedStationId?: string | null;
  onSelectStation?: (station: StationWithWeather) => void;
}

// Controller component to smoothly fly map to selected station or county
function MapEffectController({
  selectedStation,
  selectedCounty,
}: {
  selectedStation?: StationWithWeather | null;
  selectedCounty: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
        duration: 1.2,
      });
    } else if (selectedCounty && selectedCounty !== "ALL") {
      // Zoom roughly based on county bounds or center
    } else if (selectedCounty === "ALL") {
      map.flyTo([23.8, 120.98], 8, { duration: 1 });
    }
  }, [selectedStation, selectedCounty, map]);

  return null;
}

// Determine marker color based on temperature
function getTempColor(temp: number | null): { bg: string; text: string; border: string } {
  if (temp === null) return { bg: "#475569", text: "#94a3b8", border: "#64748b" };
  if (temp < 15) return { bg: "#2563eb", text: "#ffffff", border: "#60a5fa" }; // Cold Blue
  if (temp < 20) return { bg: "#0284c7", text: "#ffffff", border: "#38bdf8" }; // Cool Cyan
  if (temp < 25) return { bg: "#059669", text: "#ffffff", border: "#34d399" }; // Mild Emerald
  if (temp < 28) return { bg: "#d97706", text: "#ffffff", border: "#fbbf24" }; // Warm Amber
  if (temp < 32) return { bg: "#ea580c", text: "#ffffff", border: "#fb923c" }; // Hot Orange
  return { bg: "#dc2626", text: "#ffffff", border: "#f87171" }; // Very Hot Crimson
}

// Determine marker color based on precipitation
function getRainColor(rain: number | null): { bg: string; text: string; border: string } {
  if (rain === null || rain <= 0) {
    return { bg: "#1e293b", text: "#94a3b8", border: "#334155" };
  }
  if (rain < 2) return { bg: "#0284c7", text: "#ffffff", border: "#38bdf8" };
  if (rain < 10) return { bg: "#2563eb", text: "#ffffff", border: "#60a5fa" };
  if (rain < 30) return { bg: "#7c3aed", text: "#ffffff", border: "#a78bfa" };
  return { bg: "#db2777", text: "#ffffff", border: "#f472b6" };
}

// Create custom HTML DivIcon
function createMarkerIcon(station: StationWithWeather, mode: "temp" | "rain" | "wind" | "all", isSelected: boolean) {
  let label = "";
  let color = { bg: "#0f766e", text: "#ffffff", border: "#14b8a6" };

  if (mode === "temp" || mode === "all") {
    color = getTempColor(station.airTemperature);
    label = station.airTemperature !== null ? `${station.airTemperature.toFixed(1)}°` : "-";
  } else if (mode === "rain") {
    color = getRainColor(station.precipitation);
    label = station.precipitation !== null ? `${station.precipitation.toFixed(1)}` : "-";
  } else if (mode === "wind") {
    color = { bg: "#0891b2", text: "#ffffff", border: "#22d3ee" };
    label = station.windSpeed !== null ? `${station.windSpeed.toFixed(1)}m` : "-";
  }

  const selectedRing = isSelected ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-125 z-50" : "";

  const html = `
    <div class="weather-marker-pin ${selectedRing}" style="width: auto; height: auto;">
      <div style="
        background: ${color.bg};
        color: ${color.text};
        border: 1.5px solid ${color.border};
        border-radius: 9999px;
        padding: 2px 7px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5), 0 0 8px ${color.border}88;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>${label}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-weather-pin",
    html: html,
    iconSize: [36, 24],
    iconAnchor: [18, 12],
    popupAnchor: [0, -14],
  });
}

export default function TaiwanWeatherMap({
  stations,
  selectedCounty,
  displayMode,
  selectedStationId,
  onSelectStation,
}: TaiwanWeatherMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<Geometry> | null>(null);

  // Load Taiwan GeoJSON boundaries
  useEffect(() => {
    fetch("/data/taiwan_counties.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Error loading Taiwan GeoJSON:", err));
  }, []);

  // Filter stations based on selected county
  const filteredStations = useMemo(() => {
    if (!selectedCounty || selectedCounty === "ALL") {
      return stations;
    }
    return stations.filter((s) => s.countyName.includes(selectedCounty));
  }, [stations, selectedCounty]);

  const activeStation = useMemo(() => {
    if (!selectedStationId) return null;
    return stations.find((s) => s.stationId === selectedStationId) || null;
  }, [stations, selectedStationId]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={[23.8, 120.98]}
        zoom={8}
        minZoom={7}
        maxZoom={16}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap TileLayer with high contrast and dark filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Taiwan Boundary GeoJSON Layer */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => {
              const name = feature?.properties?.COUNTYNAME;
              const isMatch = selectedCounty && selectedCounty !== "ALL" && name?.includes(selectedCounty);
              return {
                color: isMatch ? "#38bdf8" : "#0284c7",
                weight: isMatch ? 2.5 : 1.2,
                opacity: isMatch ? 0.9 : 0.45,
                fillColor: isMatch ? "#38bdf8" : "#38bdf8",
                fillOpacity: isMatch ? 0.15 : 0.02,
                dashArray: isMatch ? "3, 5" : undefined,
              };
            }}
            onEachFeature={(feature, layer) => {
              const countyName = feature.properties?.COUNTYNAME || "";
              layer.bindTooltip(countyName, {
                sticky: true,
                className: "px-2 py-1 bg-slate-900/90 text-sky-200 text-xs rounded shadow border border-sky-500/30",
              });
            }}
          />
        )}

        {/* Dynamic effect controller */}
        <MapEffectController selectedStation={activeStation} selectedCounty={selectedCounty} />

        {/* Weather Station Markers */}
        {filteredStations.map((station) => {
          const isSelected = station.stationId === selectedStationId;
          const icon = createMarkerIcon(station, displayMode, isSelected);

          return (
            <Marker
              key={station.stationId}
              position={[station.latitude, station.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectStation) {
                    onSelectStation(station);
                  }
                },
              }}
            >
              <Popup className="weather-popup">
                <div className="p-4 w-72 text-slate-100">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-700/80 pb-2.5 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                        <h4 className="font-bold text-base text-white tracking-wide">
                          {station.stationName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {station.countyName} {station.townName} • ID: {station.stationId}
                      </p>
                    </div>
                    {station.weatherDescription && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                        {station.weatherDescription}
                      </span>
                    )}
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {/* Temperature */}
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                        <Thermometer className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block leading-tight">即時氣溫</span>
                        <span className="text-lg font-bold text-slate-100">
                          {station.airTemperature !== null ? `${station.airTemperature.toFixed(1)}°C` : "未測得"}
                        </span>
                      </div>
                    </div>

                    {/* Precipitation */}
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <CloudRain className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block leading-tight">時降雨量</span>
                        <span className="text-lg font-bold text-slate-100">
                          {station.precipitation !== null ? `${station.precipitation.toFixed(1)} mm` : "0.0 mm"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details */}
                  <div className="space-y-1.5 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" /> 相對濕度
                      </span>
                      <span className="font-medium">
                        {station.relativeHumidity !== null ? `${station.relativeHumidity}%` : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" /> 風速
                      </span>
                      <span className="font-medium">
                        {station.windSpeed !== null ? `${station.windSpeed} m/s` : "—"}
                      </span>
                    </div>

                    {station.airPressure && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Compass className="w-3.5 h-3.5 text-purple-400" /> 氣壓
                        </span>
                        <span className="font-medium">{station.airPressure} hPa</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3" /> 觀測時間
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {station.obsTime
                          ? new Date(station.obsTime).toLocaleTimeString("zh-TW", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "最新"}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
