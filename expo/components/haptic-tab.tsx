import { type ReactNode } from "react";
import { Platform, Pressable, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * HapticTab — a Pressable tab wrapper that fires a light impact on iOS.
 * Use as the `tabBarButton` option in expo-router tab layouts.
 */
export function HapticTab(props: PressableProps & { children?: ReactNode }) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (Platform.OS === "ios") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        props.onPress?.(event);
      }}
    >
      {props.children}
    </Pressable>
  );
}
