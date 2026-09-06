import { type ReactNode } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * useColorScheme — re-export of React Native's hook with an explicit return
 * type so consumers get strict typing ('light' | 'dark' | null).
 */
export function useColorScheme(): "light" | "dark" | null {
  return useRNColorScheme() as "light" | "dark" | null;
}

export type ColorSchemeName = NonNullable<ReturnType<typeof useColorScheme>> | null;

declare module "react" {
  interface Attributes {
    children?: ReactNode;
  }
}
