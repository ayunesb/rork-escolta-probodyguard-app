import { StyleSheet, View } from "react-native";
import { Link, Stack } from "expo-router";
import { ShieldAlert } from "lucide-react-native";

import { ThemedText } from "@/components/themed-text";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container} testID="not-found-container">
        <ShieldAlert size={64} color={Colors.gold} style={styles.icon} />
        <ThemedText type="title" style={styles.title}>
          This screen does not exist.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>
            Go to home screen!
          </ThemedText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  linkText: {
    color: Colors.gold,
  },
});
