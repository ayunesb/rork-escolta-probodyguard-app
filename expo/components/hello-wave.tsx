import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";

/**
 * HelloWave — a waving 👋 emoji animation on mount.
 */
export function HelloWave() {
  const rotationAngle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(rotationAngle, {
          toValue: 25,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotationAngle, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 },
    );
    wave.start();
    return () => wave.stop();
  }, [rotationAngle]);

  return (
    <Animated.View style={[{ transform: [{ rotate: rotationAngle.interpolate({ inputRange: [0, 25], outputRange: ["0deg", "25deg"] }) }] }]}>
      <Text style={styles.emoji}>👋</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
