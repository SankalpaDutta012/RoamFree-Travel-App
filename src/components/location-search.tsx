"use client";

import type { ChangeEvent} from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Loader2 } from 'lucide-react';
import type { MapboxFeature, MapboxGeocodingResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationSelect: (feature: MapboxFeature) => void;
  initialSearchTerm?: string;
}

// Debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export function LocationSearch({ onLocationSelect, initialSearchTerm = "" }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const fetchLocations = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxApiKey) {
      setResults([]);
      setShowResults(false);
      if (query.trim() && !mapboxApiKey) {
        console.error("Mapbox API key not configured.");
        toast({
            title: "Configuration Error",
            description: "Mapbox API key is missing.",
            variant: "destructive",
        });
      }
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxApiKey}&types=place,locality,region,country,poi&limit=5`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = (await response.json()) as MapboxGeocodingResponse;
      setResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Search Error',
        description: 'Could not fetch locations. Please try again.',
        variant: 'destructive',
      });
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  }, [mapboxApiKey, toast]);
  
  const debouncedFetchLocations = useCallback(debounce(fetchLocations, 300), [fetchLocations]);

  useEffect(() => {
    if (initialSearchTerm) {
      // No need to fetch on initial mount with initialSearchTerm, 
      // as page.tsx handles initial location setting
      // If you want initial search based on this term, uncomment:
      // debouncedFetchLocations(initialSearchTerm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm]); // Only run on initial mount if initialSearchTerm is present


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === "") {
      setResults([]);
      setShowResults(false);
      setIsLoading(false); // Stop loading if search term is cleared
    } else {
      setIsLoading(true); // Show loader immediately
      debouncedFetchLocations(newSearchTerm);
    }
  };

  const handleResultClick = (feature: MapboxFeature) => {
    onLocationSelect(feature);
    setSearchTerm(feature.place_name);
    setShowResults(false);
    setResults([]); // Clear results after selection
  };

  const clearSearch = () => {
    setSearchTerm(''); 
    setResults([]); 
    setShowResults(false);
    setIsLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div 
      className="relative w-full"
      onBlur={(e) => {
        // Hide results if click is outside the search component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setShowResults(false);
        }
      }}
    >
      <div className="flex items-center gap-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Search className="h-5 w-5 ml-3 text-muted-foreground shrink-0" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && results.length > 0 && setShowResults(true)}
          className="flex-grow text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2 py-2 h-10"
          aria-label="Search location"
        />
        {isLoading && (
            <Loader2 className="h-5 w-5 mr-3 text-muted-foreground animate-spin shrink-0" />
        )}
        {!isLoading && searchTerm && (
            <Button variant="ghost" size="icon" onClick={clearSearch} className="mr-1 shrink-0 h-8 w-8">
                <X className="h-5 w-5" />
                 <span className="sr-only">Clear search</span>
            </Button>
        )}
      </div>
      {showResults && results.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full shadow-lg bg-card border border-border">
          <CardContent className="p-0">
            <ul className="max-h-60 overflow-y-auto py-1">
              {results.map((feature) => (
                <li key={feature.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 rounded-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleResultClick(feature)}
                  >
                    {feature.place_name}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
