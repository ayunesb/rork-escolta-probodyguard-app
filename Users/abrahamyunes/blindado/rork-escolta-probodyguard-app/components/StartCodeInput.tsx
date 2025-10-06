import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface StartCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  length?: number;
}

export default function StartCodeInput({ 
  value, 
  onChange, 
  onComplete, 
  length = 6 
}: StartCodeInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete();
    }
  }, [value, length, onComplete]);

  const handleChangeText = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (numericText.length === 1) {
      const newValue = value.slice(0, index) + numericText + value.slice(index + 1);
      onChange(newValue);
      
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length > 1) {
      const pastedValue = numericText.slice(0, length);
      onChange(pastedValue);
      
      const nextIndex = Math.min(pastedValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            value[index] ? styles.inputFilled : null,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={index === 0}
          testID={`start-code-input-${index}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600' as const,
    textAlign: 'center',
    backgroundColor: '#FFF',
    color: '#000',
  },
  inputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
});
