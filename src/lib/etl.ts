import { fetchCWAWeatherStations, FetchCWAOptions } from "./cwaApi";
import { cleanCWAStationList } from "./cleaner";
import { upsertStations, insertWeatherDataBatch, getDatabaseStats } from "./db";

export interface ETLResult {
  success: boolean;
  totalFetched: number;
  totalCleaned: number;
  stationsUpserted: number;
  weatherRecordsInserted: number;
  dbStats: { stationCount: number; observationCount: number };
  durationMs: number;
  error?: string;
}

/**
 * Execute full ETL pipeline:
 * 1. Fetch from CWA Open API
 * 2. Clean and validate records
 * 3. Store into SQLite Database
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
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      totalFetched: 0,
      totalCleaned: 0,
      stationsUpserted: 0,
      weatherRecordsInserted: 0,
      dbStats: { stationCount: 0, observationCount: 0 },
      durationMs,
      error: (error as Error).message || String(error),
    };
  }
}
