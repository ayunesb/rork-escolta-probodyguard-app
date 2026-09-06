import { type PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";

import { ThemedText } from "@/components/themed-text";
import Colors from "@/constants/colors";

/**
 * Collapsible — a simple expandable section.
 */
export function Collapsible({ children, title }: PropsWithChildren<{ title: string }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
      >
        {isOpen ? (
          <ChevronDown size={18} color={Colors.gold} />
        ) : (
          <ChevronRight size={18} color={Colors.gold} />
        )}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </Pressable>
      {isOpen ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
