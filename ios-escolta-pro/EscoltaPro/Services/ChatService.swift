import Foundation
import FirebaseFirestore

/// Booking chat backed by the Firestore `messages` collection (mirrors
/// expo/services/chatService.ts document shape).
@MainActor
@Observable
final class ChatService {
    static let shared = ChatService()

    private(set) var messages: [ChatMessage] = []
    private var listener: ListenerRegistration?

    func listen(bookingID: String) {
        stopListening()
        guard FirebaseBootstrap.configured else { return }

        listener = Firestore.firestore()
            .collection("messages")
            .whereField("bookingId", isEqualTo: bookingID)
            .addSnapshotListener { [weak self] snapshot, _ in
                let decoded: [ChatMessage] = (snapshot?.documents ?? []).compactMap { doc in
                    guard var message = ModelDecoder.decode(ChatMessage.self, from: doc.data()) else {
                        return nil
                    }
                    message.id = doc.documentID
                    return message
                }
                Task { @MainActor in
                    self?.messages = decoded.sorted { $0.timestamp < $1.timestamp }
                }
            }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
        messages = []
    }

    func send(text: String, bookingID: String, sender: UserProfile) async {
        let body = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return }

        let payload: [String: Any] = [
            "bookingId": bookingID,
            "senderId": sender.id,
            "senderRole": sender.role.rawValue,
            "text": body,
            "originalLanguage": sender.language,
            "timestamp": Date.now.timeIntervalSince1970 * 1000,
        ]

        if FirebaseBootstrap.configured {
            _ = try? await Firestore.firestore().collection("messages").addDocument(data: payload)
        } else {
            messages.append(ChatMessage(
                id: UUID().uuidString, bookingId: bookingID, senderId: sender.id,
                senderRole: sender.role.rawValue, text: body,
                originalLanguage: sender.language, translatedText: nil,
                translatedLanguage: nil, timestamp: Date.now.timeIntervalSince1970 * 1000
            ))
        }
    }
}
