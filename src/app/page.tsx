"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LocationSearch } from '@/components/location-search';
import { LocationDetails } from '@/components/location-details';
import type { Location } from '@/lib/types';
import { RoamFreeLogo } from '@/components/icons/roamfree-logo';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import InteractiveMap with ssr: false
const InteractiveMap = dynamic(() => 
  import('@/components/interactive-map').then(mod => mod.InteractiveMap),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-full rounded-lg" data-ai-hint="map placeholder" />
  }
);


// Default coordinates (London, UK)
const DEFAULT_LONGITUDE = -0.1278;
const DEFAULT_LATITUDE = 51.5074;
const DEFAULT_LOCATION_NAME = "London";
const DEFAULT_COUNTRY = "United Kingdom";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number; zoom: number; key: number }>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: 9,
    key: Date.now(), 
  });
  const [initialSearchDone, setInitialSearchDone] = useState(false);


  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter({
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: 13,
      key: Date.now(),
    });
  };
  
  useEffect(() => {
    if (!initialSearchDone) {
      const defaultLocation: Location = {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        name: DEFAULT_LOCATION_NAME,
        fullName: `${DEFAULT_LOCATION_NAME}, ${DEFAULT_COUNTRY}`,
        country: DEFAULT_COUNTRY,
      };
      setSelectedLocation(defaultLocation);
      setInitialSearchDone(true);
    }
  }, [initialSearchDone]);

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    console.log("Map clicked at:", event.latlng); // Corrected to latlng for Leaflet
    // Potentially update selected location based on reverse geocoding result for event.latlng
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <RoamFreeLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RoamFree
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid md:grid-cols-3 gap-6 h-full min-h-[calc(100vh-10rem)]">
          <div className="md:col-span-2 flex flex-col gap-6">
            <LocationSearch 
              onLocationSelect={handleLocationSelect} 
              initialSearchTerm={selectedLocation?.fullName || DEFAULT_LOCATION_NAME} // Use fullName for initial search
            />
            <div className="flex-grow rounded-lg overflow-hidden shadow-md">
               <InteractiveMap
                key={mapCenter.key} 
                location={selectedLocation}
                zoom={mapCenter.zoom}
                markerLabel={selectedLocation?.name}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <LocationDetails location={selectedLocation} />
          </div>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t bg-background/80">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built with passion for exploration. &copy; {new Date().getFullYear()} RoamFree.
          </p>
        </div>
      </footer>
    </div>
  );
}
