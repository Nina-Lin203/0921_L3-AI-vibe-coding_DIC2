import { CleanedStation, CleanedWeatherData, RawCWAStation } from "@/types/weather";

/**
 * Safely parse numeric weather element values, converting missing markers (-99, -99.0) to null
 */
function parseWeatherMetric(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === "number" ? value : parseFloat(String(value).trim());
  if (isNaN(num)) return null;
  // CWA conventions: -99, -99.0, -999 represent missing/invalid sensor readings
  if (num <= -90) return null;
  return num;
}

/**
 * Extract WGS84 geographic coordinate (latitude & longitude)
 */
function extractWGS84Coordinates(station: RawCWAStation): { latitude: number; longitude: number } | null {
  const coords = station.GeoInfo?.Coordinates;
  if (!Array.isArray(coords) || coords.length === 0) return null;

  // Prefer WGS84 coordinates
  const wgs84 = coords.find((c) => c.CoordinateName?.toUpperCase() === "WGS84") || coords[0];

  const lat = parseFloat(wgs84?.StationLatitude);
  const lng = parseFloat(wgs84?.StationLongitude);

  if (isNaN(lat) || isNaN(lng)) return null;

  // Basic bounding check for Taiwan and surrounding islands (Penghu, Kinmen, Matsu, Orchid Is.)
  if (lat < 20 || lat > 27 || lng < 117 || lng > 123) {
    return null;
  }

  return { latitude: lat, longitude: lng };
}

/**
 * Clean and normalize weather description
 */
function parseWeatherDescription(rawDesc: unknown, precip: number | null): string {
  const desc = typeof rawDesc === "string" ? rawDesc.trim() : "";
  if (!desc || desc === "-99" || desc === "-99.0") {
    if (precip !== null && precip > 0) {
      return precip >= 10 ? "強降雨" : "降雨中";
    }
    return "陰/多雲";
  }
  return desc;
}

export interface CleanedStationResult {
  station: CleanedStation;
  weather: CleanedWeatherData;
}

/**
 * Clean a single raw CWA station record
 */
export function cleanCWAStation(raw: RawCWAStation): CleanedStationResult | null {
  if (!raw || !raw.StationId || !raw.StationName) {
    return null;
  }

  const coords = extractWGS84Coordinates(raw);
  if (!coords) {
    return null;
  }

  const weatherElem = raw.WeatherElement || {};

  // Precipitation may be located in Now.Precipitation or directly in WeatherElement.Precipitation
  const rawPrecip = weatherElem.Now?.Precipitation ?? weatherElem.Precipitation;
  const precip = parseWeatherMetric(rawPrecip);
  const temp = parseWeatherMetric(weatherElem.AirTemperature);
  const humidity = parseWeatherMetric(weatherElem.RelativeHumidity);
  const windSpeed = parseWeatherMetric(weatherElem.WindSpeed);
  const pressure = parseWeatherMetric(weatherElem.AirPressure);
  const weatherDesc = parseWeatherDescription(weatherElem.Weather, precip);

  const obsTime = raw.ObsTime?.DateTime || new Date().toISOString();

  const station: CleanedStation = {
    stationId: raw.StationId.trim(),
    stationName: raw.StationName.trim(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    countyName: raw.GeoInfo?.CountyName?.trim() || "未知縣市",
    townName: raw.GeoInfo?.TownName?.trim() || "",
    altitude: parseWeatherMetric(raw.GeoInfo?.StationAltitude),
  };

  const weather: CleanedWeatherData = {
    stationId: station.stationId,
    obsTime,
    airTemperature: temp,
    precipitation: precip !== null && precip < 0 ? 0 : precip,
    relativeHumidity: humidity,
    windSpeed: windSpeed,
    airPressure: pressure,
    weatherDescription: weatherDesc,
  };

  return { station, weather };
}

/**
 * Clean a collection of raw CWA stations
 */
export function cleanCWAStationList(rawList: RawCWAStation[]): CleanedStationResult[] {
  if (!Array.isArray(rawList)) return [];

  const results: CleanedStationResult[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawList) {
    const cleaned = cleanCWAStation(raw);
    if (cleaned && !seenIds.has(cleaned.station.stationId)) {
      seenIds.add(cleaned.station.stationId);
      results.push(cleaned);
    }
  }

  return results;
}
