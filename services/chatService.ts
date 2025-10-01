import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage, Language, UserRole } from '@/types';

export const sendMessage = async (
  bookingId: string,
  senderId: string,
  senderRole: UserRole,
  text: string,
  originalLanguage: Language
): Promise<ChatMessage> => {
  try {
    console.log('[Chat] Sending message:', { bookingId, senderId, text });

    const message = {
      bookingId,
      senderId,
      senderRole,
      text,
      originalLanguage,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'messages'), message);

    return {
      id: docRef.id,
      ...message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Chat] Send message error:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  bookingId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  try {
    console.log('[Chat] Subscribing to messages:', bookingId);

    const q = query(
      collection(db, 'messages'),
      where('bookingId', '==', bookingId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const messages: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          bookingId: data.bookingId,
          senderId: data.senderId,
          senderRole: data.senderRole,
          text: data.text,
          originalLanguage: data.originalLanguage,
          translatedText: data.translatedText,
          translatedLanguage: data.translatedLanguage,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });

      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Chat] Subscribe error:', error);
    return () => {};
  }
};

export const translateMessage = async (
  text: string,
  targetLanguage: Language
): Promise<string> => {
  try {
    console.log('[Chat] Translating message:', { text, targetLanguage });

    return text;
  } catch (error) {
    console.error('[Chat] Translation error:', error);
    return text;
  }
};
