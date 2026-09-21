import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { CleanedStation, CleanedWeatherData, StationWithWeather } from "@/types/weather";

let dbInstance: Database.Database | null = null;

/**
 * Get or initialize the SQLite database connection
 */
export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // Support custom DATABASE_URL or default to ./data/weather.db
  let dbPath: string;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    dbPath = process.env.DATABASE_URL.replace("file:", "");
  } else if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    dbPath = "/tmp/weather.db";
  } else {
    const dataDir = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, "weather.db");
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Create tables
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

    CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather_data (station_id, obs_time DESC);
  `);

  dbInstance = db;
  return db;
}

/**
 * Upsert station metadata into database
 */
export function upsertStations(stations: CleanedStation[]): number {
  if (stations.length === 0) return 0;
  const db = getDatabase();

  const stmt = db.prepare(`
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

  const insertMany = db.transaction((items: CleanedStation[]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });

  insertMany(stations);
  return stations.length;
}

/**
 * Insert or update weather observations into database
 */
export function insertWeatherDataBatch(records: CleanedWeatherData[]): number {
  if (records.length === 0) return 0;
  const db = getDatabase();

  const stmt = db.prepare(`
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

  const insertMany = db.transaction((items: CleanedWeatherData[]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });

  insertMany(records);
  return records.length;
}

/**
 * Retrieve all stations with their latest weather observation
 */
export function getLatestWeatherStations(): StationWithWeather[] {
  const db = getDatabase();

  const query = `
    SELECT 
      s.station_id as stationId,
      s.station_name as stationName,
      s.latitude,
      s.longitude,
      s.county_name as countyName,
      s.town_name as townName,
      s.altitude,
      w.obs_time as obsTime,
      w.air_temperature as airTemperature,
      w.precipitation,
      w.relative_humidity as relativeHumidity,
      w.wind_speed as windSpeed,
      w.air_pressure as airPressure,
      w.weather_description as weatherDescription,
      s.updated_at as updatedAt
    FROM stations s
    LEFT JOIN (
      SELECT * FROM weather_data
      WHERE id IN (
        SELECT MAX(id) FROM weather_data GROUP BY station_id
      )
    ) w ON s.station_id = w.station_id
    ORDER BY s.county_name, s.station_name
  `;

  return db.prepare(query).all() as StationWithWeather[];
}

/**
 * Get total counts for status reporting
 */
export function getDatabaseStats(): { stationCount: number; observationCount: number } {
  const db = getDatabase();
  const stationRow = db.prepare("SELECT COUNT(*) as count FROM stations").get() as { count: number };
  const observationRow = db.prepare("SELECT COUNT(*) as count FROM weather_data").get() as { count: number };

  return {
    stationCount: stationRow.count,
    observationCount: observationRow.count,
  };
}
