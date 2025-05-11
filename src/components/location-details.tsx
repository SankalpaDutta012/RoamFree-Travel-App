"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { Location, OpenWeatherMapResponse } from '@/lib/types';
import { WeatherIcon } from "./weather-icon";
import { PhotoGallery } from './photo-gallery';
import { Thermometer, Droplets, Wind, Globe, Info, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationDetailsProps {
  location: Location | null;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const { toast } = useToast();

  const openWeatherMapApiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
 
  useEffect(() => {
    if (location && location.longitude && location.latitude) { 
      const fetchWeather = async () => {
        if (!openWeatherMapApiKey) {
          setWeatherError("OpenWeatherMap API key not configured.");
          return;
        }
        setIsLoadingWeather(true);
        setWeatherError(null);
        try {
          const { latitude, longitude } = location;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapApiKey}&units=metric`
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
          setWeatherError(errorMessage);
          toast({
            title: 'Weather Error',
            description: `Could not fetch weather: ${errorMessage}`,
            variant: 'destructive',
          });
          setWeather(null);
        } finally {
          setIsLoadingWeather(false);
        }
      };
      fetchWeather();
    } else {
      setWeather(null);
      setWeatherError(null);
      setIsLoadingWeather(false); 
    }
  }, [location, toast, openWeatherMapApiKey]);

  if (!location) {
    return (
      <Card className="h-full shadow-lg border-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-secondary/70 border border-secondary">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">No Location Selected</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Search for a location or click on the map to see details here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const country = location.country || 'N/A';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric'
  });

  return (
    <Card className="h-full shadow-lg overflow-y-auto border-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">{location.name || 'Unknown Location'}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              {location.fullName ? location.fullName.split(', ').slice(1).join(', ') : country}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{today}</span>
            </div>
            {location.latitude && location.longitude && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
          <span className="bg-primary/10 p-1 rounded mr-2">
            <Thermometer className="h-5 w-5 text-primary" />
          </span>
          Current Weather
        </h3>
        {isLoadingWeather && (
          <div className="space-y-4 p-4 bg-card/50 rounded-lg border border-border/30">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-1/2 rounded-md" />
              <Skeleton className="h-12 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        )}
        {weatherError && !isLoadingWeather && (
           <Alert variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/30">
             <Info className="h-5 w-5" />
             <AlertTitle className="font-semibold">Weather Data Unavailable</AlertTitle>
             <AlertDescription>{weatherError}</AlertDescription>
           </Alert>
        )}
        {weather && !isLoadingWeather && !weatherError && (
          <div className="space-y-4 p-4 bg-card/50 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <WeatherIcon iconCode={weather.weather[0].icon} altText={weather.weather[0].description} size={42}/>
                </div>
                <div>
                  <p className="text-lg capitalize font-medium">{weather.weather[0].description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{Math.round(weather.main.temp)}°C</p>
                <p className="text-sm text-muted-foreground">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col items-center p-3 bg-card rounded-lg border border-border/30 hover:shadow-md transition-shadow">
                <Thermometer className="h-6 w-6 mb-2 text-orange-500" />
                <p className="text-sm font-medium">Temperature</p>
                <p className="font-semibold mt-1">{Math.round(weather.main.temp)}°C</p>
                <p className="text-xs text-muted-foreground">Feels: {Math.round(weather.main.feels_like)}°C</p>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-card rounded-lg border border-border/30 hover:shadow-md transition-shadow">
                <Droplets className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-sm font-medium">Humidity</p>
                <p className="font-semibold mt-1">{weather.main.humidity}%</p>
                <p className="text-xs text-muted-foreground">Atmospheric moisture</p>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-card rounded-lg border border-border/30 hover:shadow-md transition-shadow">
                <Wind className="h-6 w-6 mb-2 text-teal-500" />
                <p className="text-sm font-medium">Wind</p>
                <p className="font-semibold mt-1">{weather.wind.speed.toFixed(1)} m/s</p>
                <p className="text-xs text-muted-foreground">Wind speed</p>
              </div>
            </div>
          </div>
        )}
        {!isLoadingWeather && !weather && !weatherError && (!location.latitude || !location.longitude) && (
          <Alert variant="default" className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
            <Info className="h-5 w-5" />
            <AlertTitle className="font-semibold">Location Incomplete</AlertTitle>
            <AlertDescription>
              The selected location does not have coordinates to fetch weather for.
            </AlertDescription>
          </Alert>
        )}
        
        <PhotoGallery locationName={location.name} />

      </CardContent>
    </Card>
  );
}