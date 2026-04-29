import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { City } from '../data/cities';

interface MapComponentProps {
  origin: City;
  dest: City;
  currentLat: number;
  currentLon: number;
  airplaneHeading: number;
  onAirplanePress?: () => void;
}

// Origin & Dest Custom Icons (no image assets needed)
const OriginIcon = L.divIcon({
  html: `<div style="width: 16px; height: 16px; background-color: #F87171; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const DestIcon = L.divIcon({
  html: `<div style="width: 16px; height: 16px; background-color: #34D399; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom Airplane Icon
const AirplaneIcon = L.divIcon({
  html: `<div style="font-size: 28px; text-align: center; line-height: 1; cursor: pointer;">✈️</div>`,
  className: 'airplane-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to handle dynamic map bounds fitting
const MapFitBounds = ({ origin, dest }: { origin: City, dest: City }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lon],
        [dest.lat, dest.lon]
      );
      // Removed the large padding BottomRight to center map perfectly
      map.fitBounds(bounds, { paddingBottomRight: [50, 50], paddingTopLeft: [50, 50], animate: true });
    }
  }, [map, origin, dest]);
  return null;
};

// Component to rotate the airplane div based on heading
const AirplaneMarker = ({ lat, lon, heading, onPress }: { lat: number, lon: number, heading: number, onPress?: () => void }) => {
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    if (markerRef.current) {
      const element = markerRef.current.getElement();
      if (element) {
        const div = element.firstChild as HTMLElement;
        if (div) {
          // Adjust rotation based on heading.
          div.style.transform = `rotate(${heading}deg)`;
        }
      }
    }
  }, [heading, lat, lon]); 

  return (
    <Marker 
      position={[lat, lon]} 
      icon={AirplaneIcon} 
      ref={markerRef} 
      eventHandlers={onPress ? { click: onPress } : undefined}
    />
  );
};

export default function MapComponent({ origin, dest, currentLat, currentLon, airplaneHeading, onAirplanePress }: MapComponentProps) {
  if (!origin || !dest) return null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapContainer 
        bounds={[[origin.lat, origin.lon], [dest.lat, dest.lon]]}
        style={{ height: '100%', width: '100%', backgroundColor: '#0F172A' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <Polyline 
          positions={[[origin.lat, origin.lon], [dest.lat, dest.lon]]}
          pathOptions={{ color: '#60A5FA', weight: 3, dashArray: '10, 10' }}
        />
        
        <Marker position={[origin.lat, origin.lon]} icon={OriginIcon} />
        <Marker position={[dest.lat, dest.lon]} icon={DestIcon} />

        <AirplaneMarker lat={currentLat} lon={currentLon} heading={airplaneHeading} onPress={onAirplanePress} />
        
        <MapFitBounds origin={origin} dest={dest} />
      </MapContainer>
    </View>
  );
}
