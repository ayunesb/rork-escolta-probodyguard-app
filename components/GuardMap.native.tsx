import { useRef } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Guard } from '@/types';

interface GuardMapProps {
  guards: Guard[];
  clientLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function GuardMap({ guards, clientLocation }: GuardMapProps) {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      initialRegion={clientLocation}
      showsUserLocation
      showsMyLocationButton
    >
      {guards.map((guard) => (
        <Marker
          key={guard.id}
          coordinate={{
            latitude: guard.latitude || 40.7580,
            longitude: guard.longitude || -73.9855,
          }}
          onPress={() => router.push({ pathname: '/guard-detail', params: { id: guard.id } } as any)}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerInner}>
              <Image source={{ uri: guard.photos[0] }} style={styles.markerImage} />
            </View>
            <View style={styles.markerArrow} />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gold,
    padding: 3,
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.background,
    marginTop: -3,
  },
});
