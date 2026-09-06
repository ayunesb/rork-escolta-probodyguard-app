import { type PropsWithChildren, useRef } from "react";
import { Animated, ImageSourcePropType, ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/themed-view";
import Colors from "@/constants/colors";

/**
 * ParallaxScrollView — scroll view with a subtle parallax header image.
 */
type Props = PropsWithChildren<{
  headerImage: ImageSourcePropType;
  headerBackgroundColor?: { dark: string; light: string };
}>;

const HEADER_HEIGHT = 250;

export function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, HEADER_HEIGHT / 2],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [2, 1, 1],
    extrapolate: "clamp",
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor?.dark ?? Colors.surface },
            { transform: [{ translateY: headerTranslate }, { scale: headerScale }] },
          ]}
        >
          {headerImage ? (
            <Animated.Image
              source={headerImage}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : null}
        </Animated.View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    gap: 16,
    overflow: "hidden",
    padding: 16,
  },
});
