"use client";

import { useState, useEffect } from 'react';
import { LocationSearch } from '@/components/location-search';
import { InteractiveMap } from '@/components/interactive-map';
import { LocationDetails } from '@/components/location-details';
import type { MapboxFeature } from '@/lib/types';
import { RoamFreeLogo } from '@/components/icons/roamfree-logo';

// Default coordinates (London, UK)
const DEFAULT_LONGITUDE = -0.1278;
const DEFAULT_LATITUDE = 51.5074;
const DEFAULT_LOCATION_NAME = "London";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<MapboxFeature | null>(null);
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number; zoom: number; key: number }>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: 9,
    key: Date.now(), // Key to force map re-render on programmatic change
  });
  const [initialSearchDone, setInitialSearchDone] = useState(false);


  const handleLocationSelect = (feature: MapboxFeature) => {
    setSelectedLocation(feature);
    setMapCenter({
      longitude: feature.center[0],
      latitude: feature.center[1],
      zoom: 13, // Zoom in more when a specific location is selected
      key: Date.now(),
    });
  };
  
  // Effect to set an initial location on load
  useEffect(() => {
    if (!initialSearchDone) {
      // Create a mock MapboxFeature for the default location
      // This would ideally be fetched, but for simplicity, we mock it
      // or rely on LocationSearch to fetch it if an initial term is passed.
      const defaultFeature: MapboxFeature = {
        id: 'default-location',
        type: 'Feature',
        place_type: ['place'],
        relevance: 1,
        properties: {},
        text: DEFAULT_LOCATION_NAME,
        place_name: `${DEFAULT_LOCATION_NAME}, United Kingdom`, // Example place_name
        center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
        geometry: {
          type: 'Point',
          coordinates: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
        },
        context: [
          { id: `country.${DEFAULT_LOCATION_NAME.toLowerCase()}`, text: 'United Kingdom' }
        ],
      };
      setSelectedLocation(defaultFeature);
      setMapCenter({
        longitude: DEFAULT_LONGITUDE,
        latitude: DEFAULT_LATITUDE,
        zoom: 9,
        key: Date.now(),
      });
      setInitialSearchDone(true);
    }
  }, [initialSearchDone]);

  const handleMapClick = (event: mapboxgl.MapLayerMouseEvent) => {
    // For simplicity, this example doesn't perform reverse geocoding on map click.
    // A full implementation would use event.lngLat to fetch location details.
    console.log("Map clicked at:", event.lngLat);
    // Potentially set a marker and fetch data for this point
    // For now, let's just update the map center if we want to explore this feature
    // setSelectedLocation(null); // Clear detailed location if just clicking map
    // setMapCenter({
    //   longitude: event.lngLat.lng,
    //   latitude: event.lngLat.lat,
    //   zoom: mapCenter.zoom, // keep current zoom or adjust
    //   key: Date.now(),
    // });
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
          {/* Future: Add Dark Mode Toggle or other header items here */}
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid md:grid-cols-3 gap-6 h-full min-h-[calc(100vh-10rem)]"> {/* Adjust min-height as needed */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <LocationSearch 
              onLocationSelect={handleLocationSelect} 
              initialSearchTerm={DEFAULT_LOCATION_NAME}
            />
            <div className="flex-grow rounded-lg overflow-hidden">
               <InteractiveMap
                key={mapCenter.key} // Force re-render when key changes
                longitude={mapCenter.longitude}
                latitude={mapCenter.latitude}
                zoom={mapCenter.zoom}
                markerLabel={selectedLocation?.text}
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