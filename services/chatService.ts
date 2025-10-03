import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ChatMessage, Language } from '@/types';
import { translationService } from './translationService';

export const chatService = {
  async sendMessage(
    bookingId: string,
    senderId: string,
    senderRole: 'client' | 'guard',
    text: string,
    originalLanguage: Language
  ): Promise<void> {
    try {
      const messageData = {
        bookingId,
        senderId,
        senderRole,
        text,
        originalLanguage,
        timestamp: Timestamp.now(),
      };

      await addDoc(collection(db, 'messages'), messageData);
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
        collection(db, 'messages'),
        where('bookingId', '==', bookingId),
        orderBy('timestamp', 'asc')
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
        collection(db, 'messages'),
        where('bookingId', '==', bookingId),
        orderBy('timestamp', 'asc')
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
        collection(db, 'messages'),
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
};
