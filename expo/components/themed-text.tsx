import { StyleSheet, Text, type TextProps } from "react-native";

import Colors from "@/constants/colors";

/**
 * ThemedText — the project's standard text component.
 *
 * The `type` prop maps to the app's typography scale; arbitrary TextProps
 * (style, numberOfLines, etc.) pass through untouched.
 */
export type ThemedTextProps = TextProps & {
  type?: "default" | "defaultSemiBold" | "title" | "subtitle" | "link";
  color?: string;
};

export function ThemedText({ type = "default", color, style, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: color ?? Colors.textPrimary },
        type === "default" ? styles.default : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: Colors.gold,
  },
});
