import { fetchCWAWeatherStations, FetchCWAOptions } from "./cwaApi";
import { cleanCWAStationList } from "./cleaner";
import { upsertStations, insertWeatherDataBatch, getDatabaseStats } from "./db";
import { seedDemoData } from "./demoData";

export interface ETLResult {
  success: boolean;
  totalFetched: number;
  totalCleaned: number;
  stationsUpserted: number;
  weatherRecordsInserted: number;
  dbStats: { stationCount: number; observationCount: number };
  durationMs: number;
  isDemo?: boolean;
  error?: string;
}

/**
 * Execute full ETL pipeline:
 * 1. Fetch from CWA Open API
 * 2. Clean and validate records
 * 3. Store into SQLite Database
 * 4. Fallback to realistic demo data if API key is not configured and DB is empty
 */
export async function runWeatherETL(options: FetchCWAOptions = {}): Promise<ETLResult> {
  const startTime = Date.now();

  try {
    // 1. Fetch raw stations
    const rawStations = await fetchCWAWeatherStations(options);

    // 2. Clean data
    const cleanedResults = cleanCWAStationList(rawStations);

    const stationsToSave = cleanedResults.map((r) => r.station);
    const weatherToSave = cleanedResults.map((r) => r.weather);

    // 3. Write to Database
    const stationsUpserted = upsertStations(stationsToSave);
    const weatherRecordsInserted = insertWeatherDataBatch(weatherToSave);

    const dbStats = getDatabaseStats();
    const durationMs = Date.now() - startTime;

    return {
      success: true,
      totalFetched: rawStations.length,
      totalCleaned: cleanedResults.length,
      stationsUpserted,
      weatherRecordsInserted,
      dbStats,
      durationMs,
    };
  } catch (error) {
    const dbStats = getDatabaseStats();

    // If database is completely empty and fetch failed (e.g. no CWA_API_KEY), populate demo data
    if (dbStats.stationCount === 0) {
      console.log("⚠️ CWA API unavailable or missing API Key. Seeding realistic Taiwan demo data...");
      const seeded = seedDemoData();
      const updatedStats = getDatabaseStats();
      const durationMs = Date.now() - startTime;
      return {
        success: true,
        isDemo: true,
        totalFetched: seeded,
        totalCleaned: seeded,
        stationsUpserted: seeded,
        weatherRecordsInserted: seeded,
        dbStats: updatedStats,
        durationMs,
        error: (error as Error).message,
      };
    }

    const durationMs = Date.now() - startTime;
    return {
      success: false,
      totalFetched: 0,
      totalCleaned: 0,
      stationsUpserted: 0,
      weatherRecordsInserted: 0,
      dbStats,
      durationMs,
      error: (error as Error).message || String(error),
    };
  }
}
