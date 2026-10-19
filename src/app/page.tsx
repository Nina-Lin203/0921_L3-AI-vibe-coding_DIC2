import WeatherDashboard from "@/components/WeatherDashboard";
import { DEMO_STATIONS } from "@/lib/demoData";
import { StationWithWeather } from "@/types/weather";

export default function Home() {
  const initialStations: StationWithWeather[] = DEMO_STATIONS.map(({ station, weather }) => ({
    ...station,
    obsTime: weather.obsTime,
    airTemperature: weather.airTemperature,
    precipitation: weather.precipitation,
    relativeHumidity: weather.relativeHumidity,
    windSpeed: weather.windSpeed,
    airPressure: weather.airPressure,
    weatherDescription: weather.weatherDescription,
  }));

  return <WeatherDashboard initialStations={initialStations} />;
}
