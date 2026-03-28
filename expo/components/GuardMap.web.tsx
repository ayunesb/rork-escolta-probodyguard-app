import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

export default function GuardMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view not available on web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  text: {
    color: Colors.textSecondary,
  },
});
