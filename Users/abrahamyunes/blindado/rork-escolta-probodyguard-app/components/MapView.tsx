import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent, { Marker, Region, Polyline } from 'react-native-maps';

export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  pinColor?: string;
}

export interface MapPolyline {
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  strokeColor?: string;
  strokeWidth?: number;
}

interface MapViewProps {
  initialRegion: Region;
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  onMarkerPress?: (markerId: string) => void;
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
}

export default function MapView({ 
  initialRegion, 
  markers = [], 
  polylines = [],
  onMarkerPress,
  showsUserLocation = true,
  followsUserLocation = false,
}: MapViewProps) {
  return (
    <View style={styles.container}>
      <MapViewComponent
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton
        followsUserLocation={followsUserLocation}
      >
        {polylines.map((polyline, index) => (
          <Polyline
            key={`polyline-${index}`}
            coordinates={polyline.coordinates}
            strokeColor={polyline.strokeColor || '#007AFF'}
            strokeWidth={polyline.strokeWidth || 4}
          />
        ))}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor}
            onPress={() => onMarkerPress?.(marker.id)}
          />
        ))}
      </MapViewComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
