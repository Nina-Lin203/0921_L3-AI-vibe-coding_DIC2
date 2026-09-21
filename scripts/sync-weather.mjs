import dotenv from "dotenv";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
dotenv.config({ path: path.join(rootDir, ".env") });

const apiKey = process.env.CWA_API_KEY;
if (!apiKey) {
  console.error("❌ Error: CWA_API_KEY is not defined in .env");
  process.exit(1);
}

console.log("🌦️  Starting CWA Weather ETL Pipeline...");

const dataDir = path.join(rootDir, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "weather.db"));
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS stations (
    station_id TEXT PRIMARY KEY,
    station_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    county_name TEXT NOT NULL,
    town_name TEXT,
    altitude REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id TEXT NOT NULL,
    obs_time TEXT NOT NULL,
    air_temperature REAL,
    precipitation REAL,
    relative_humidity REAL,
    wind_speed REAL,
    air_pressure REAL,
    weather_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id),
    UNIQUE(station_id, obs_time)
  );
`);

async function runETL() {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${apiKey.trim()}`;
  console.log("📡 Fetching real-time stations from CWA API (O-A0001-001)...");

  const start = Date.now();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CWA API response error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.success !== "true" && json.success !== true) {
    throw new Error("CWA API returned unsuccessful status");
  }

  const rawStations = json.records?.Station || [];
  console.log(`📥 Received ${rawStations.length} raw stations. Cleaning data...`);

  const stationStmt = db.prepare(`
    INSERT INTO stations (station_id, station_name, latitude, longitude, county_name, town_name, altitude, updated_at)
    VALUES (@stationId, @stationName, @latitude, @longitude, @countyName, @townName, @altitude, CURRENT_TIMESTAMP)
    ON CONFLICT(station_id) DO UPDATE SET
      station_name = excluded.station_name,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      county_name = excluded.county_name,
      town_name = excluded.town_name,
      altitude = excluded.altitude,
      updated_at = CURRENT_TIMESTAMP
  `);

  const weatherStmt = db.prepare(`
    INSERT INTO weather_data (
      station_id, obs_time, air_temperature, precipitation, relative_humidity, wind_speed, air_pressure, weather_description
    ) VALUES (
      @stationId, @obsTime, @airTemperature, @precipitation, @relativeHumidity, @windSpeed, @airPressure, @weatherDescription
    )
    ON CONFLICT(station_id, obs_time) DO UPDATE SET
      air_temperature = excluded.air_temperature,
      precipitation = excluded.precipitation,
      relative_humidity = excluded.relative_humidity,
      wind_speed = excluded.wind_speed,
      air_pressure = excluded.air_pressure,
      weather_description = excluded.weather_description
  `);

  let validStations = 0;

  const transaction = db.transaction(() => {
    for (const raw of rawStations) {
      const coords = raw.GeoInfo?.Coordinates || [];
      const wgs84 = coords.find((c) => c.CoordinateName?.toUpperCase() === "WGS84") || coords[0];
      const lat = parseFloat(wgs84?.StationLatitude);
      const lng = parseFloat(wgs84?.StationLongitude);

      if (isNaN(lat) || isNaN(lng) || lat < 20 || lat > 27 || lng < 117 || lng > 123) {
        continue;
      }

      const parseNum = (v) => {
        if (v === undefined || v === null) return null;
        const n = parseFloat(v);
        return isNaN(n) || n <= -90 ? null : n;
      };

      const we = raw.WeatherElement || {};
      const precip = parseNum(we.Now?.Precipitation ?? we.Precipitation);
      const temp = parseNum(we.AirTemperature);
      const hum = parseNum(we.RelativeHumidity);
      const wind = parseNum(we.WindSpeed);
      const press = parseNum(we.AirPressure);

      let desc = we.Weather;
      if (!desc || desc === "-99" || desc === "-99.0") {
        desc = precip && precip > 0 ? "降雨中" : "多雲/陰";
      }

      const stationData = {
        stationId: raw.StationId.trim(),
        stationName: raw.StationName.trim(),
        latitude: lat,
        longitude: lng,
        countyName: raw.GeoInfo?.CountyName?.trim() || "未知縣市",
        townName: raw.GeoInfo?.TownName?.trim() || "",
        altitude: parseNum(raw.GeoInfo?.StationAltitude),
      };

      const weatherData = {
        stationId: stationData.stationId,
        obsTime: raw.ObsTime?.DateTime || new Date().toISOString(),
        airTemperature: temp,
        precipitation: precip !== null && precip < 0 ? 0 : precip,
        relativeHumidity: hum,
        windSpeed: wind,
        airPressure: press,
        weatherDescription: desc,
      };

      stationStmt.run(stationData);
      weatherStmt.run(weatherData);
      validStations++;
    }
  });

  transaction();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  const countRow = db.prepare("SELECT COUNT(*) as count FROM stations").get();

  console.log(`✅ ETL Completed in ${elapsed}s!`);
  console.log(`📊 Valid Stations Processed: ${validStations}`);
  console.log(`💾 Total Stations in Database: ${countRow.count}`);
}

runETL().catch((err) => {
  console.error("❌ ETL Failed:", err.message);
  process.exit(1);
});
