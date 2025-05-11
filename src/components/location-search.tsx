"use client";

import type { ChangeEvent} from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import type { MapboxFeature, MapboxGeocodingResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationSelect: (feature: MapboxFeature) => void;
  initialSearchTerm?: string;
}

export function LocationSearch({ onLocationSelect, initialSearchTerm = "" }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const fetchLocations = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxApiKey) {
      setResults([]);
      setShowResults(false);
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

  useEffect(() => {
    if (initialSearchTerm) {
      fetchLocations(initialSearchTerm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm]); // Only run on initial mount if initialSearchTerm is present

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === "") {
      setResults([]);
      setShowResults(false);
    }
  };
  
  const handleSearch = () => {
    if (searchTerm.trim()) {
        fetchLocations(searchTerm);
    } else {
        setResults([]);
        setShowResults(false);
    }
  };

  const handleResultClick = (feature: MapboxFeature) => {
    onLocationSelect(feature);
    setSearchTerm(feature.place_name);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && results.length > 0 && setShowResults(true)}
          className="flex-grow text-base"
          aria-label="Search location"
        />
        {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setResults([]); setShowResults(false); }} className="shrink-0">
                <X className="h-5 w-5" />
            </Button>
        )}
        <Button onClick={handleSearch} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
          <Search className="h-5 w-5 mr-2 sm:mr-0" />
          <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
        </Button>
      </div>
      {showResults && results.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full shadow-lg bg-card">
          <CardContent className="p-0">
            <ul className="max-h-60 overflow-y-auto">
              {results.map((feature) => (
                <li key={feature.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 rounded-none"
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