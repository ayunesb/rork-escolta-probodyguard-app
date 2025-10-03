import { View, Text, StyleSheet } from 'react-native';

const MapView = ({ children, ...props }: any) => {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.text}>Map not available on web</Text>
      {children}
    </View>
  );
};

export const Marker = ({ children, ...props }: any) => null;
export const Polyline = (props: any) => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    color: '#666',
    fontSize: 16,
  },
});

export default MapView;
