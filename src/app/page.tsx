import { getLatestWeatherStations, getDatabaseStats } from "@/lib/db";
import { runWeatherETL } from "@/lib/etl";
import WeatherDashboard from "@/components/WeatherDashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let stats = getDatabaseStats();

  // If local DB is empty on first load, run ETL automatically
  if (stats.stationCount === 0) {
    try {
      await runWeatherETL();
    } catch (err) {
      console.error("Initial ETL run failed:", err);
    }
  }

  const initialStations = getLatestWeatherStations();

  return <WeatherDashboard initialStations={initialStations} />;
}
