import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent, { Marker, Region } from 'react-native-maps';

export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
}

interface MapViewProps {
  initialRegion: Region;
  markers?: MapMarker[];
  onMarkerPress?: (markerId: string) => void;
}

export default function MapView({ initialRegion, markers = [], onMarkerPress }: MapViewProps) {
  return (
    <View style={styles.container}>
      <MapViewComponent
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
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
