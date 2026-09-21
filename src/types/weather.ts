export interface RawCWAStation {
  StationName: string;
  StationId: string;
  ObsTime: {
    DateTime: string;
  };
  GeoInfo: {
    Coordinates: Array<{
      CoordinateName: string;
      CoordinateFormat: string;
      StationLatitude: string;
      StationLongitude: string;
    }>;
    StationAltitude?: string;
    CountyName?: string;
    TownName?: string;
    CountyCode?: string;
    TownCode?: string;
  };
  WeatherElement: {
    Weather?: string;
    Now?: {
      Precipitation?: string;
    };
    Precipitation?: string;
    WindDirection?: string;
    WindSpeed?: string;
    AirTemperature?: string;
    RelativeHumidity?: string;
    AirPressure?: string;
    [key: string]: unknown;
  };
}

export interface RawCWAResponse {
  success: string | boolean;
  result?: {
    resource_id: string;
  };
  records?: {
    Station?: RawCWAStation[];
    location?: RawCWAStation[];
  };
}

export interface CleanedStation {
  stationId: string;
  stationName: string;
  latitude: number;
  longitude: number;
  countyName: string;
  townName: string;
  altitude: number | null;
}

export interface CleanedWeatherData {
  stationId: string;
  obsTime: string;
  airTemperature: number | null;
  precipitation: number | null;
  relativeHumidity: number | null;
  windSpeed: number | null;
  airPressure: number | null;
  weatherDescription: string;
}

export interface StationWithWeather extends CleanedStation {
  obsTime: string | null;
  airTemperature: number | null;
  precipitation: number | null;
  relativeHumidity: number | null;
  windSpeed: number | null;
  airPressure: number | null;
  weatherDescription: string | null;
  updatedAt?: string;
}
