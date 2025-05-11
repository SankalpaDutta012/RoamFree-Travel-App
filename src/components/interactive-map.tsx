"use client";

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Maximize, ZoomIn, ZoomOut, Layers, Info, Map as MapIcon } from 'lucide-react';
import { Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcon = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    // Fix the icon default path issue with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

interface InteractiveMapProps {
  location: Location | null;
  zoom?: number;
  markerLabel?: string;
  onMapClick?: (event: L.LeafletMouseEvent) => void;
  initialCoordinates?: [number, number]; // Default coordinates if no location
}

export function InteractiveMap({
  location,
  zoom = 9,
  markerLabel,
  onMapClick,
  initialCoordinates = [51.505, -0.09] // Default to London
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeBaseMap, setActiveBaseMap] = useState<string>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize map
  useEffect(() => {
    fixLeafletIcon();
    
    // Set coordinates based on location or default
    const coordinates: [number, number] = location?.latitude && location?.longitude 
      ? [location.latitude, location.longitude] 
      : initialCoordinates;
    
    if (!mapRef.current && mapContainerRef.current) {
      // Create map instance
      mapRef.current = L.map('map', {
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: false, // We'll add custom attribution
      }).setView(coordinates, zoom);
      
      // Add tile layer (street map)
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      // Add satellite imagery layer (not added to map by default)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      });
      
      // Add terrain layer
      const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      });
      
      // Store layers for later use
      (mapRef.current as any).baseLayers = {
        street: streetLayer,
        satellite: satelliteLayer,
        terrain: terrainLayer
      };
      
      // Add custom attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addTo(mapRef.current);
      
      // Add click handler
      if (onMapClick) {
        mapRef.current.on('click', onMapClick);
      }
    }
    
    return () => {
      // No need to destroy the map on every render
    };
  }, []);

  // Update view when location changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    const coordinates: [number, number] = location?.latitude && location?.longitude 
      ? [location.latitude, location.longitude] 
      : initialCoordinates;
    
    // Update map view
    mapRef.current.setView(coordinates, zoom, { animate: true });
    
    // Update or create marker
    if (coordinates) {
      const customIcon = L.divIcon({
        html: `
          <div class="relative inline-block">
            <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
              ${markerLabel || (location?.name || 'Selected location')}
            </div>
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="white"/>
                <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full opacity-30"></div>
          </div>
        `,
        className: '',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });
      
      if (markerRef.current) {
        markerRef.current.setLatLng(coordinates);
      } else if (mapRef.current) {
        markerRef.current = L.marker(coordinates, { icon: customIcon }).addTo(mapRef.current);
      }
    }
  }, [location, zoom, markerLabel]);

  // Handle layer switching
  const switchBaseMap = (type: string) => {
    if (!mapRef.current || !(mapRef.current as any).baseLayers) return;
    
    const layers = (mapRef.current as any).baseLayers;
    
    // Remove all layers
    Object.values(layers).forEach((layer: any) => {
      mapRef.current?.removeLayer(layer);
    });
    
    // Add selected layer
    if (layers[type]) {
      layers[type].addTo(mapRef.current);
      setActiveBaseMap(type);
    }
  };

  // Handle zoom in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (!mapRef.current) return;
    
    if (direction === 'in') {
      mapRef.current.zoomIn(1);
    } else {
      mapRef.current.zoomOut(1);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapRef.current) {
        // Need to invalidate the map size when entering/exiting fullscreen
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Card className="w-full h-[400px] md:h-[500px] lg:h-full overflow-hidden shadow-lg relative border-none bg-slate-50 dark:bg-slate-900" ref={mapContainerRef}>
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1.5 flex items-center gap-1.5">
        <div className="flex items-center space-x-1 pr-2 border-r border-border">
          <MapIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Map</span>
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeBaseMap === 'street' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => switchBaseMap('street')}
              >
                Street
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Street map view</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeBaseMap === 'satellite' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => switchBaseMap('satellite')}
              >
                Satellite
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Satellite imagery</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeBaseMap === 'terrain' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => switchBaseMap('terrain')}
              >
                Terrain
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Topographic map</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1.5 flex flex-col gap-1.5">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom('in')}>
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom in</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom('out')}>
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle fullscreen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {!location && (
        <div className="absolute bottom-4 left-4 z-[999] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium">No Location Selected</h4>
              <p className="text-xs text-muted-foreground mt-1">Search for a location or click on the map to select a point of interest.</p>
            </div>
          </div>
        </div>
      )}

      <div id="map" className="w-full h-full"></div>
    </Card>
  );
}