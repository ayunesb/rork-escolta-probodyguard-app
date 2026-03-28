import React from "react";
import { View, Text, Button } from "react-native";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("[ErrorBoundary] App crashed:", error, info);
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      // native fallback
      console.log("Reloading app...");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: "600" }}>
            Something went wrong.
          </Text>
          <Text
            selectable
            style={{ color: "#777", marginBottom: 20, textAlign: "center" }}
          >
            {this.state.error?.message}
          </Text>
          <Button title="Reload App" onPress={this.handleReload} />
        </View>
      );
    }

    return this.props.children;
  }
}

export { AppErrorBoundary as RorkErrorBoundary };
