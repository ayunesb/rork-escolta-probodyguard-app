import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

const MapView = ({ children, ...props }: any) => {
  return (
    <View style={[styles.mapPlaceholder, props.style]}>
      <Text style={styles.placeholderText}>Map view not available on web</Text>
      {children}
    </View>
  );
};

export const Marker = ({ children, ...props }: any) => null;
export const Polyline = (props: any) => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  mapPlaceholder: {
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

export default MapView;
