import { NextResponse } from "next/server";
import { getLatestWeatherStations, getDatabaseStats } from "@/lib/db";
import { runWeatherETL } from "@/lib/etl";

export const dynamic = "force-dynamic";

/**
 * GET /api/weather
 * Returns stations with latest weather data.
 * Automatically runs ETL if database is currently empty.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get("county");
    const forceSync = searchParams.get("sync") === "true";

    let stats = getDatabaseStats();

    // If database is empty or sync parameter is explicitly requested, run ETL
    if (stats.stationCount === 0 || forceSync) {
      const syncResult = await runWeatherETL();
      if (!syncResult.success && stats.stationCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `ETL failed and no cached data exists: ${syncResult.error}`,
          },
          { status: 502 }
        );
      }
      stats = getDatabaseStats();
    }

    let stations = getLatestWeatherStations();

    if (county) {
      stations = stations.filter((s) => s.countyName.includes(county));
    }

    return NextResponse.json({
      success: true,
      stats,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Internal server error fetching weather data",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weather
 * Trigger an on-demand ETL sync from CWA Open API
 */
export async function POST() {
  try {
    const result = await runWeatherETL();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to trigger weather sync",
      },
      { status: 500 }
    );
  }
}
