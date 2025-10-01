import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ChevronLeft, Globe } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import type { ChatMessage } from '@/types';

export default function BookingChatScreen() {
  const { bookingId, guardName } = useLocalSearchParams<{
    bookingId: string;
    guardName: string;
  }>();
  
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      bookingId: bookingId || '',
      senderId: 'guard-1',
      senderRole: 'guard',
      text: 'Hello! I am on my way to the pickup location. ETA 10 minutes.',
      originalLanguage: 'en',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      bookingId: bookingId || '',
      senderId: user.id,
      senderRole: user.role,
      text: inputText.trim(),
      originalLanguage: user.language,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        bookingId: bookingId || '',
        senderId: 'guard-1',
        senderRole: 'guard',
        text: 'Understood. I will be there shortly.',
        originalLanguage: 'en',
        translatedText: user.language !== 'en' ? 'Entendido. Estaré allí en breve.' : undefined,
        translatedLanguage: user.language !== 'en' ? user.language : undefined,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, autoReply]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    const showTranslation = item.translatedText && item.translatedLanguage;

    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {showTranslation ? item.translatedText : item.text}
          </Text>
          {showTranslation && (
            <View style={styles.translationBadge}>
              <Globe size={10} color={isMe ? Colors.gold : Colors.textSecondary} />
              <Text style={[styles.translationText, isMe && styles.translationTextMe]}>
                Auto-translated from {item.originalLanguage.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{guardName}</Text>
          <Text style={styles.headerSubtitle}>Active Service</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.messagesList, { paddingBottom: insets.bottom + 80 }]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={20} color={inputText.trim() ? Colors.background : Colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageContainerMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  messageTextMe: {
    color: Colors.background,
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
  },
  translationText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  translationTextMe: {
    color: Colors.background + 'CC',
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  messageTimeMe: {
    color: Colors.background + 'AA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
});
