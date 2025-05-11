"use client";

import type { ChangeEvent} from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Loader2, MapPin } from 'lucide-react';
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
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
  }, [initialSearchTerm]);

  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      ref={searchContainerRef}
    >
      <div className="flex items-center gap-2 border border-input rounded-lg overflow-hidden bg-background/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm hover:shadow">
        <div className="flex items-center justify-center ml-3 bg-primary/10 rounded-full p-1.5">
          <Search className="h-4 w-4 text-primary shrink-0" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && results.length > 0 && setShowResults(true)}
          className="flex-grow text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2 py-2 h-11 bg-transparent"
          aria-label="Search location"
        />
        {isLoading && (
          <div className="mr-3 p-1 bg-primary/5 rounded-full">
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
          </div>
        )}
        {!isLoading && searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearSearch} 
            className="mr-2 shrink-0 h-7 w-7 rounded-full hover:bg-muted/80"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      {showResults && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full shadow-lg bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <ul className="max-h-72 overflow-y-auto divide-y divide-border/30">
              {results.map((location) => (
                <li key={location.id || `${location.latitude}-${location.longitude}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3 px-4 rounded-none hover:bg-accent hover:text-accent-foreground transition-colors group"
                    onClick={() => handleResultClick(location)}
                  >
                    <div className="flex items-start mr-2">
                      <div className="mt-0.5 bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {location.fullName ? location.fullName.split(', ').slice(1).join(', ') : location.country || ''}
                      </p>
                      {location.latitude && location.longitude && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
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