import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ChevronLeft, Globe } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import type { ChatMessage } from '@/types';
import { chatService, TypingIndicator } from '@/services/chatService';
import { useDebounce } from '@/hooks/useDebounce';

export default function BookingChatScreen() {
  const { bookingId, guardName } = useLocalSearchParams<{
    bookingId: string;
    guardName: string;
  }>();
  
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedInputText = useDebounce(inputText, 300);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!bookingId || !user) return;

    setIsLoading(true);
    const unsubscribeMessages = chatService.subscribeToMessages(
      bookingId,
      user.language,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setIsLoading(false);
      }
    );

    const unsubscribeTyping = chatService.subscribeToTyping(
      bookingId,
      user.id,
      setTypingUsers
    );

    chatService.markAsRead(bookingId, user.id);

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [bookingId, user]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (!bookingId || !user) return;

    if (inputText.length > 0) {
      chatService.setTyping(bookingId, user.id, `${user.firstName} ${user.lastName}`, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTyping(bookingId, user.id, `${user.firstName} ${user.lastName}`, false);
      }, 3000);
    } else {
      chatService.setTyping(bookingId, user.id, `${user.firstName} ${user.lastName}`, false);
    }
  }, [debouncedInputText, bookingId, user, inputText.length]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !user || !bookingId) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await chatService.sendMessage(
        bookingId,
        user.id,
        user.role as 'client' | 'guard',
        messageText,
        user.language
      );
      
      chatService.setTyping(bookingId, user.id, `${user.firstName} ${user.lastName}`, false);
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      setInputText(messageText);
    }
  }, [inputText, user, bookingId]);

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
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )
        }
        ListFooterComponent={
          typingUsers.length > 0 ? (
            <TypingIndicatorComponent typingUsers={typingUsers} />
          ) : null
        }
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

function TypingIndicatorComponent({ typingUsers }: { typingUsers: TypingIndicator[] }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const userName = typingUsers[0]?.userName || 'Someone';
  const displayText = typingUsers.length === 1
    ? `${userName} is typing`
    : `${typingUsers.length} people are typing`;

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>{displayText}</Text>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
        </View>
      </View>
    </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  typingContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
});
