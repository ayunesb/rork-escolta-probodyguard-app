import Foundation
import FirebaseFirestore
import FirebaseDatabase

/// Reviews written to the Firestore `reviews` collection (mirrors
/// expo/services/ratingsService.ts) with the booking rating patched back onto
/// the Realtime DB booking record.
enum RatingsService {
    struct Submission: Sendable {
        var rating: Double
        var professionalism: Double
        var punctuality: Double
        var communication: Double
        var languageClarity: Double
        var review: String
    }

    static func submit(
        booking: Booking,
        client: UserProfile,
        submission: Submission
    ) async throws {
        let payload: [String: Any] = [
            "bookingId": booking.id,
            "clientId": client.id,
            "clientName": client.fullName,
            "guardId": booking.guardId ?? "",
            "rating": submission.rating,
            "professionalism": submission.professionalism,
            "punctuality": submission.punctuality,
            "communication": submission.communication,
            "languageClarity": submission.languageClarity,
            "review": submission.review,
            "createdAt": ISO8601DateFormatter().string(from: .now),
        ]

        if FirebaseBootstrap.configured {
            let db = Firestore.firestore()
            try await db.collection("reviews").addDocument(data: payload)

            // Patch the booking record so history screens show the rating.
            let bookingRef = Database.database(url: "https://\(Config.EXPO_PUBLIC_FIREBASE_PROJECT_ID)-default-rtdb.firebaseio.com")
                .reference(withPath: "bookings/\(booking.id)")
            try await bookingRef.updateChildValues([
                "rating": submission.rating,
                "review": submission.review,
            ])

            // Nudge the guard's aggregate rating.
            if let guardID = booking.guardId {
                let guardRef = db.collection("users").document(guardID)
                let snapshot = try await guardRef.getDocument()
                let previous = snapshot.data()?["rating"] as? Double ?? submission.rating
                let jobs = snapshot.data()?["completedJobs"] as? Int ?? 1
                let newRating = ((previous * Double(jobs)) + submission.rating) / Double(jobs + 1)
                try await guardRef.setData([
                    "rating": (newRating * 10).rounded() / 10,
                    "completedJobs": jobs + 1,
                ], merge: true)
            }
        }
    }
}
