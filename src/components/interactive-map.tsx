"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import { Map, Marker, NavigationControl } from 'react-map-gl';
import { MapPin } from 'lucide-react';

interface InteractiveMapProps {
  longitude: number;
  latitude: number;
  zoom?: number;
  markerLabel?: string;
  onMapClick?: (event: mapboxgl.MapLayerMouseEvent) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function InteractiveMap({
  longitude,
  latitude,
  zoom = 9,
  markerLabel,
  onMapClick,
}: InteractiveMapProps) {
  
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-destructive-foreground">Mapbox token is not configured.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-full rounded-lg overflow-hidden shadow-md" data-ai-hint="world map">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude,
          latitude,
          zoom,
        }}
        longitude={longitude}
        latitude={latitude}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={onMapClick}
        attributionControl={false} // Handled by react-map-gl
      >
        <NavigationControl position="top-right" />
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          <MapPin className="w-8 h-8 text-accent fill-accent/70" aria-label={markerLabel || 'Selected location'} />
        </Marker>
      </Map>
    </div>
  );
}