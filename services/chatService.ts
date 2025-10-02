import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  updateDoc,
  doc,
  serverTimestamp
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

export const updateTypingStatus = async (
  bookingId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    console.log('[Chat] Updating typing status:', { bookingId, userId, isTyping });

    const typingRef = doc(db, 'typing', `${bookingId}_${userId}`);
    
    if (isTyping) {
      await updateDoc(typingRef, {
        bookingId,
        userId,
        isTyping: true,
        timestamp: serverTimestamp(),
      }).catch(async () => {
        await addDoc(collection(db, 'typing'), {
          bookingId,
          userId,
          isTyping: true,
          timestamp: serverTimestamp(),
        });
      });
    } else {
      await updateDoc(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp(),
      }).catch(() => {});
    }
  } catch (error) {
    console.error('[Chat] Update typing status error:', error);
  }
};

export const subscribeToTypingStatus = (
  bookingId: string,
  currentUserId: string,
  callback: (isTyping: boolean, userId: string) => void
): (() => void) => {
  try {
    console.log('[Chat] Subscribing to typing status:', bookingId);

    const q = query(
      collection(db, 'typing'),
      where('bookingId', '==', bookingId),
      where('isTyping', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userId !== currentUserId) {
          const timestamp = data.timestamp?.toDate?.()?.getTime() || 0;
          const now = Date.now();
          
          if (now - timestamp < 5000) {
            callback(true, data.userId);
          }
        }
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Chat] Subscribe to typing error:', error);
    return () => {};
  }
};
