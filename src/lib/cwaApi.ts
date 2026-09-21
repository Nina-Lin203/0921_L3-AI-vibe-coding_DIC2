import { RawCWAResponse, RawCWAStation } from "@/types/weather";

const DEFAULT_CWA_API_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001";

export interface FetchCWAOptions {
  apiKey?: string;
  limit?: number;
  stationId?: string;
  timeoutMs?: number;
}

/**
 * Fetch real-time weather station observation data from CWA Open API
 * Dataset: O-A0001-001 (自動氣象站資料)
 */
export async function fetchCWAWeatherStations(options: FetchCWAOptions = {}): Promise<RawCWAStation[]> {
  const apiKey = options.apiKey || process.env.CWA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing CWA_API_KEY. Please configure CWA_API_KEY in your .env file.");
  }

  const url = new URL(DEFAULT_CWA_API_URL);
  url.searchParams.set("Authorization", apiKey.trim());
  if (options.limit) {
    url.searchParams.set("limit", options.limit.toString());
  }
  if (options.stationId) {
    url.searchParams.set("StationId", options.stationId);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `CWA API Request failed with status ${response.status} (${response.statusText}): ${errorText.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as RawCWAResponse;

    if (data.success !== "true" && data.success !== true) {
      throw new Error("CWA API returned unsuccessful response status.");
    }

    const stations = data.records?.Station || data.records?.location || [];
    return stations;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("CWA API request timed out after 15 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
