import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApiTestScreen() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testHealthEndpoint = async () => {
    try {
      addResult('Testing /api/health...');
      const response = await fetch('/api/health');
      const data = await response.json();
      addResult(`✅ Health: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addResult(`❌ Health error: ${error.message}`);
    }
  };

  const testTestEndpoint = async () => {
    try {
      addResult('Testing /api/test...');
      const response = await fetch('/api/test');
      const data = await response.json();
      addResult(`✅ Test: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addResult(`❌ Test error: ${error.message}`);
    }
  };

  const testTrpcEndpoint = async () => {
    try {
      addResult('Testing /api/trpc/example.hi...');
      const response = await fetch('/api/trpc/example.hi', {
        method: 'GET',
      });
      const contentType = response.headers.get('content-type');
      addResult(`Response status: ${response.status}`);
      addResult(`Content-Type: ${contentType}`);
      
      const text = await response.text();
      addResult(`Response preview: ${text.substring(0, 200)}`);
      
      if (contentType?.includes('application/json')) {
        const data = JSON.parse(text);
        addResult(`✅ tRPC: ${JSON.stringify(data)}`);
      } else {
        addResult(`❌ tRPC returned non-JSON: ${text.substring(0, 100)}`);
      }
    } catch (error: any) {
      addResult(`❌ tRPC error: ${error.message}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'API Test' }} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testHealthEndpoint}>
          <Text style={styles.buttonText}>Test /api/health</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTestEndpoint}>
          <Text style={styles.buttonText}>Test /api/test</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTrpcEndpoint}>
          <Text style={styles.buttonText}>Test tRPC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#333',
  },
});
