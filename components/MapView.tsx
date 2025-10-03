import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MapViewProps {
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function MapView({ style, children, ...props }: MapViewProps) {
  return (
    <View style={[styles.webMapPlaceholder, style]}>
      <MapPin size={48} color={Colors.textTertiary} />
      <Text style={styles.webMapText}>Map view available on mobile devices</Text>
    </View>
  );
}

export function Marker({ children, ...props }: any) {
  return null;
}

export function Polyline(props: any) {
  return null;
}

export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  webMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 16,
  },
  webMapText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
