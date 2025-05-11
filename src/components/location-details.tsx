"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { MapboxFeature, OpenWeatherMapResponse } from '@/lib/types';
import { WeatherIcon } from './weather-icon';
import { Thermometer, Droplets, Wind, Globe, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationDetailsProps {
  location: MapboxFeature | null;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const openWeatherMapApiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  useEffect(() => {
    if (location && location.center) {
      const fetchWeather = async () => {
        if (!openWeatherMapApiKey) {
          setError("OpenWeatherMap API key not configured.");
          // console.error removed as the error is handled by setError and toast
          return;
        }
        setIsLoading(true);
        setError(null);
        try {
          const [lon, lat] = location.center;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherMapApiKey}&units=metric`
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
          }
          const data = (await response.json()) as OpenWeatherMapResponse;
          setWeather(data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          console.error('Error fetching weather:', errorMessage);
          setError(errorMessage);
          toast({
            title: 'Weather Error',
            description: `Could not fetch weather: ${errorMessage}`,
            variant: 'destructive',
          });
          setWeather(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWeather();
    } else {
      setWeather(null);
      setError(null);
      setIsLoading(false); // Ensure loading is false if no location
    }
  }, [location, openWeatherMapApiKey, toast]);

  if (!location) {
    return (
      <Card className="h-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-secondary">
            <Info className="h-5 w-5" />
            <AlertTitle>No Location Selected</AlertTitle>
            <AlertDescription>
              Search for a location or click on the map to see details here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const country = location.context?.find(ctx => ctx.id.startsWith('country'))?.text || 'N/A';

  return (
    <Card className="h-full shadow-lg overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{location.text || location.place_name.split(',')[0]}</CardTitle>
        <CardDescription className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            {country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-3 text-primary">Current Weather</h3>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        )}
        {error && !isLoading && (
           <Alert variant="destructive">
             <Info className="h-5 w-5" />
             <AlertTitle>Weather Data Unavailable</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {weather && !isLoading && !error && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <WeatherIcon iconCode={weather.weather[0].icon} altText={weather.weather[0].description} size={50}/>
                    <p className="text-lg capitalize ml-2">{weather.weather[0].description}</p>
                </div>
                <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center p-2 bg-muted/50 rounded-md">
                <Thermometer className="h-5 w-5 mr-2 text-accent" />
                <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
              </div>
              <div className="flex items-center p-2 bg-muted/50 rounded-md">
                <Droplets className="h-5 w-5 mr-2 text-accent" />
                <span>Humidity: {weather.main.humidity}%</span>
              </div>
              <div className="flex items-center p-2 bg-muted/50 rounded-md">
                <Wind className="h-5 w-5 mr-2 text-accent" />
                <span>Wind: {weather.wind.speed.toFixed(1)} m/s</span>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !weather && !error && !location.center && ( // Handles case where location has no center
            <Alert variant="default">
                <Info className="h-5 w-5" />
                <AlertTitle>Location Incomplete</AlertTitle>
                <AlertDescription>
                    The selected location does not have coordinates to fetch weather for.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
