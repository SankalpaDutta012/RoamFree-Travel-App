// General Location Type
export interface Location {
  id?: string; // Optional, as not all sources might provide it or it might be a number
  name: string;
  fullName?: string; // For display_name or place_name
  latitude: number;
  longitude: number;
  country?: string; // Optional country information
  // Optional fields from Nominatim/Mapbox that might be useful
  osm_id?: number;
  osm_type?: string;
  class?: string;
  type?: string;
  importance?: number;
  address?: { // Nominatim address object
    country?: string;
    // ... other address components if needed
  };
}

// OpenWeatherMap API Types
export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CloudsData {
  all: number;
}

export interface SysData {
  type?: number;
  id?: number;
  country: string;
  sunrise?: number;
  sunset?: number;
}

export interface OpenWeatherMapResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Weather[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  clouds: CloudsData;
  dt: number;
  sys: SysData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Type for results from Nominatim API, can be mapped to the general Location type
export interface NominatimGeocodingResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string]; // Corrected from Nominatim actual response
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: { // Nominatim address object
    country?: string;
    // ... other address components if needed
  };
}
