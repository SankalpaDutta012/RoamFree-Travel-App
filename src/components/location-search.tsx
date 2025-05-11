"use client";

import type { ChangeEvent} from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Loader2 } from 'lucide-react';
import type { Location, NominatimGeocodingResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
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
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch locations from Nominatim');
      }
      const data = (await response.json()) as NominatimGeocodingResult[];
      
      const formattedResults: Location[] = data.map(item => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0].trim(),
        fullName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        country: item.address?.country,
        // Optional fields from Nominatim
        osm_id: item.osm_id,
        osm_type: item.osm_type,
        class: item.class,
        type: item.type,
        importance: item.importance,
        address: item.address,
      }));
      setResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Search Error',
        description: error instanceof Error ? error.message : 'Could not fetch locations.',
        variant: 'destructive',
      });
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const debouncedFetchLocations = useCallback(debounce(fetchLocations, 300), [fetchLocations]);

  // Effect to synchronize searchTerm with initialSearchTerm prop
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    // If initialSearchTerm is cleared (e.g., by parent component), also clear results.
    if (!initialSearchTerm) {
      setResults([]);
      setShowResults(false);
      setIsLoading(false); // Reset loading state as well
    }
    // This effect does not automatically trigger a search for initialSearchTerm.
    // HomePage handles setting the initial selected location.
    // User-initiated searches are handled by handleInputChange.
  }, [initialSearchTerm]);


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === "") {
      setResults([]);
      setShowResults(false);
      setIsLoading(false); 
    } else {
      setIsLoading(true); 
      debouncedFetchLocations(newSearchTerm);
    }
  };

  const handleResultClick = (location: Location) => {
    onLocationSelect(location);
    setSearchTerm(location.fullName || location.name); // Use fullName if available
    setShowResults(false);
    setResults([]); 
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
        // Hide results if focus moves outside the search component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setShowResults(false);
        }
      }}
    >
      <div className="flex items-center gap-2 border border-input rounded-md">
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
              {results.map((location) => (
                <li key={location.id || `${location.latitude}-${location.longitude}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 rounded-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleResultClick(location)}
                  >
                    {location.fullName || location.name}
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