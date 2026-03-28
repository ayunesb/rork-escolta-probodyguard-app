import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';
import { ChatMessage, Language } from '@/types';
import { translationService } from './translationService';
import { rateLimitService } from './rateLimitService';

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: string;
}

export const chatService = {
  async sendMessage(
    bookingId: string,
    senderId: string,
    senderRole: 'client' | 'guard',
    text: string,
    originalLanguage: Language
  ): Promise<void> {
    try {
      const rateLimitCheck = await rateLimitService.checkRateLimit('chat', `${bookingId}_${senderId}`);
      if (!rateLimitCheck.allowed) {
        const errorMessage = rateLimitService.getRateLimitError('chat', rateLimitCheck.blockedUntil!);
        console.log('[Chat] Rate limit exceeded for user:', senderId);
        throw new Error(errorMessage);
      }
      
      const messageData = {
        bookingId,
        senderId,
        senderRole,
        text,
        originalLanguage,
        timestamp: Timestamp.now(),
      };

      await addDoc(collection(getDbInstance(), 'messages'), messageData);
      console.log('[Chat] Message sent:', bookingId);
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages(
    bookingId: string,
    userLanguage: Language,
    onMessagesUpdate: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      const messagesQuery = query(
        collection(getDbInstance(), 'messages'),
        where('bookingId', '==', bookingId)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const messages: ChatMessage[] = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          let translatedText: string | undefined;
          let translatedLanguage: Language | undefined;

          if (data.originalLanguage !== userLanguage) {
            try {
              translatedText = await translationService.translate(
                data.text,
                data.originalLanguage,
                userLanguage
              );
              translatedLanguage = userLanguage;
            } catch (error) {
              console.error('[Chat] Translation error:', error);
            }
          }

          messages.push({
            id: doc.id,
            bookingId: data.bookingId,
            senderId: data.senderId,
            senderRole: data.senderRole,
            text: data.text,
            originalLanguage: data.originalLanguage,
            translatedText,
            translatedLanguage,
            timestamp: data.timestamp.toDate().toISOString(),
          });
        }

        messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        onMessagesUpdate(messages);
        console.log('[Chat] Messages updated:', messages.length);
      });

      return unsubscribe;
    } catch (error) {
      console.error('[Chat] Error subscribing to messages:', error);
      return () => {};
    }
  },

  async getMessages(bookingId: string): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        collection(getDbInstance(), 'messages'),
        where('bookingId', '==', bookingId)
      );

      const snapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          bookingId: data.bookingId,
          senderId: data.senderId,
          senderRole: data.senderRole,
          text: data.text,
          originalLanguage: data.originalLanguage,
          translatedText: data.translatedText,
          translatedLanguage: data.translatedLanguage,
          timestamp: data.timestamp.toDate().toISOString(),
        });
      });

      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log('[Chat] Loaded messages:', messages.length);
      return messages;
    } catch (error) {
      console.error('[Chat] Error getting messages:', error);
      return [];
    }
  },

  async getUnreadCount(bookingId: string, userId: string): Promise<number> {
    try {
      const messagesQuery = query(
        collection(getDbInstance(), 'messages'),
        where('bookingId', '==', bookingId),
        where('senderId', '!=', userId)
      );

      const snapshot = await getDocs(messagesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('[Chat] Error getting unread count:', error);
      return 0;
    }
  },

  async setTyping(
    bookingId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const typingRef = doc(getDbInstance(), 'typing', `${bookingId}_${userId}`);
      
      if (isTyping) {
        await setDoc(typingRef, {
          bookingId,
          userId,
          userName,
          timestamp: Timestamp.now(),
        });
        console.log('[Chat] User typing:', userId);
      } else {
        await deleteDoc(typingRef);
        console.log('[Chat] User stopped typing:', userId);
      }
    } catch (error) {
      console.error('[Chat] Error setting typing status:', error);
    }
  },

  subscribeToTyping(
    bookingId: string,
    currentUserId: string,
    onTypingUpdate: (typingUsers: TypingIndicator[]) => void
  ): () => void {
    try {
      const typingQuery = query(
        collection(getDbInstance(), 'typing'),
        where('bookingId', '==', bookingId)
      );

      const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
        const typingUsers: TypingIndicator[] = [];
        const now = Date.now();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const typingTime = data.timestamp.toDate().getTime();
          
          if (data.userId !== currentUserId && now - typingTime < 5000) {
            typingUsers.push({
              userId: data.userId,
              userName: data.userName,
              timestamp: data.timestamp.toDate().toISOString(),
            });
          }
        });

        onTypingUpdate(typingUsers);
      });

      return unsubscribe;
    } catch (error) {
      console.error('[Chat] Error subscribing to typing:', error);
      return () => {};
    }
  },

  async markAsRead(bookingId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(getDbInstance(), 'messages'),
        where('bookingId', '==', bookingId),
        where('senderId', '!=', userId)
      );

      const snapshot = await getDocs(messagesQuery);
      const updatePromises = snapshot.docs.map((doc) =>
        setDoc(doc.ref, { read: true }, { merge: true })
      );

      await Promise.all(updatePromises);
      console.log('[Chat] Messages marked as read:', bookingId);
    } catch (error) {
      console.error('[Chat] Error marking messages as read:', error);
    }
  },
};
