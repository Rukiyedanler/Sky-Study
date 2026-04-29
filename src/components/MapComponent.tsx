import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import type { City } from '../data/cities';

interface MapComponentProps {
  origin: City;
  dest: City;
  currentLat: number;
  currentLon: number;
  airplaneHeading: number;
  onAirplanePress?: () => void;
}

const mapCustomStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

export default function MapComponent({ origin, dest, currentLat, currentLon, airplaneHeading, onAirplanePress }: MapComponentProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && origin && dest) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [
            { latitude: origin.lat, longitude: origin.lon },
            { latitude: dest.lat, longitude: dest.lon }
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [origin, dest]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      customMapStyle={mapCustomStyle}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Polyline
        coordinates={[
          { latitude: origin.lat, longitude: origin.lon },
          { latitude: dest.lat, longitude: dest.lon }
        ]}
        strokeColor="#60A5FA"
        strokeWidth={3}
        lineDashPattern={[10, 10]}
      />
      <Marker
        coordinate={{ latitude: origin.lat, longitude: origin.lon }}
        title={origin.name}
        pinColor="#F87171"
      />
      <Marker
        coordinate={{ latitude: dest.lat, longitude: dest.lon }}
        title={dest.name}
        pinColor="#34D399"
      />
      <Marker
        coordinate={{ latitude: currentLat, longitude: currentLon }}
        rotation={airplaneHeading}
        anchor={{ x: 0.5, y: 0.5 }}
        flat={true}
        onPress={onAirplanePress}
      >
        <Text style={{ fontSize: 28 }}>✈️</Text>
      </Marker>
    </MapView>
  );
}
