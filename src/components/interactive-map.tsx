"use client";

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { Location } from '@/lib/types';

interface InteractiveMapProps {
  location: Location | null;
  zoom?: number;
  markerLabel?: string;
  onMapClick?: (event: L.LeafletMouseEvent) => void;
}

export function InteractiveMap({
  location,
  zoom = 9,
  markerLabel,
  onMapClick
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!location) {
      // Optionally set a default view or clear the map
      return;
    }

    const { latitude, longitude } = location;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([latitude, longitude], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      if (onMapClick) {
        mapRef.current.on('click', onMapClick);
      }
    } else {
      mapRef.current.setView([latitude, longitude], zoom);
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      const customIcon = L.divIcon({
        html: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="w-8 h-8 text-accent fill-accent/70" aria-label="${markerLabel || 'Selected location'}" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"></path></svg>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);
    }
  }, [location, zoom, onMapClick, markerLabel]);

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-full rounded-lg overflow-hidden shadow-md" data-ai-hint="world map">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}