import { StyleSheet, View, type ViewProps } from "react-native";

import Colors from "@/constants/colors";

/**
 * ThemedView — a View pre-styled with the app's dark background color.
 */
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  return (
    <View
      style={[{ backgroundColor: darkColor ?? lightColor ?? Colors.background }, style]}
      {...otherProps}
    />
  );
}

export const themedViewStyles = StyleSheet.create({});
