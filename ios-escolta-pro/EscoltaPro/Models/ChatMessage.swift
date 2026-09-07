import Foundation

/// Firestore `messages/{id}` record (mirrors expo ChatMessage).
nonisolated struct ChatMessage: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var bookingId: String
    var senderId: String
    var senderRole: String
    var text: String
    var originalLanguage: String
    var translatedText: String?
    var translatedLanguage: String?
    var timestamp: Double

    var sentAt: Date {
        Date(timeIntervalSince1970: timestamp / 1000.0)
    }
}
