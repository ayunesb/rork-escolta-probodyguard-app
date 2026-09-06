import { type PropsWithChildren } from "react";
import { Platform, Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * ExternalLink — opens the wrapped link in the OS browser instead of an
 * in-app web view on native.
 */
export function ExternalLink({ href, children, ...rest }: PropsWithChildren<{ href: string }> & Record<string, unknown>) {
  return (
    <Pressable
      {...(rest as object)}
      onPress={async () => {
        if (Platform.OS !== "web") {
          // Prevent the default in-app browser opening on native.
          await WebBrowser.openBrowserAsync(href).catch(() => {});
        }
      }}
    >
      {children}
    </Pressable>
  );
}
