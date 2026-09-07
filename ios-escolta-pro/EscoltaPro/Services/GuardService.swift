import Foundation
import FirebaseFirestore

/// Guard catalog for the client home screen. Mirrors expo/mocks/guards.ts:
/// bundled profiles used instantly, refreshed from Firestore when configured.
@MainActor
@Observable
final class GuardService {
    static let shared = GuardService()

    private(set) var guards: [UserProfile] = GuardService.bundledGuards
    private(set) var isLoading = false

    func loadGuards() async {
        guard FirebaseBootstrap.configured else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            let snapshot = try await Firestore.firestore()
                .collection("users")
                .whereField("role", isEqualTo: "guard")
                .whereField("availability", isEqualTo: true)
                .getDocuments()
            let remote = snapshot.documents.compactMap {
                ModelDecoder.decode(UserProfile.self, from: $0.data())
            }
            if !remote.isEmpty {
                guards = remote
            }
        } catch {
            // Keep bundled guards on failure.
        }
    }

    func profile(withID id: String) -> UserProfile? {
        guards.first { $0.id == id }
    }

    // MARK: - Bundled catalog (mirrors expo/mocks/guards.ts)

    static let bundledGuards: [UserProfile] = [
        makeGuard(
            id: "guard-1", first: "Chris", last: "Martinez", rate: 150, rating: 4.9, jobs: 247,
            bio: "Former NYPD and US Army Protective Services Division with 12 years of executive protection experience.",
            certifications: ["HR-218 Credential", "TCCC Certified", "Advanced Driving"],
            languages: ["en", "es"], lat: 40.7580, lng: -73.9855,
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
        ),
        makeGuard(
            id: "guard-2", first: "George", last: "Thompson", rate: 175, rating: 5.0, jobs: 189,
            bio: "Former US Army Special Forces with extensive close protection and threat assessment experience.",
            certifications: ["HR-218 Credential", "Tactical Medicine", "Counter-Surveillance"],
            languages: ["en", "fr"], lat: 40.7484, lng: -73.9857,
            photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
        ),
        makeGuard(
            id: "guard-3", first: "Sofia", last: "Ramirez", rate: 140, rating: 4.8, jobs: 203,
            bio: "Bilingual protection specialist with a background in corporate security and event protection.",
            certifications: ["Executive Protection", "Defensive Driving", "First Aid"],
            languages: ["en", "es"], lat: 40.7410, lng: -74.0044,
            photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
        ),
        makeGuard(
            id: "guard-4", first: "James", last: "O'Connor", rate: 160, rating: 4.7, jobs: 156,
            bio: "Ex-Royal Marine turned close protection officer, specialising in residential and travel security.",
            certifications: ["Close Protection (SIA)", "Advanced Driving", "Surveillance Awareness"],
            languages: ["en"], lat: 40.7505, lng: -73.9934,
            photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
        ),
        makeGuard(
            id: "guard-5", first: "Andre", last: "Baptiste", rate: 185, rating: 4.9, jobs: 98,
            bio: "Diplomatic protection veteran with 15 years securing principals across three continents.",
            certifications: ["Diplomatic Protection", "TCCC Certified", "Anti-Kidnapping"],
            languages: ["en", "fr"], lat: 40.7644, lng: -73.9725,
            photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400"
        ),
        makeGuard(
            id: "guard-6", first: "Elena", last: "Kovač", rate: 155, rating: 4.8, jobs: 174,
            bio: "Former federal agent specialising in secure transport and cross-city protection details.",
            certifications: ["Secure Transport", "Threat Assessment", "Krav Maga Instructor"],
            languages: ["en", "de"], lat: 40.7282, lng: -73.9942,
            photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400"
        ),
    ]

    private static func makeGuard(
        id: String, first: String, last: String, rate: Double, rating: Double, jobs: Int,
        bio: String, certifications: [String], languages: [String],
        lat: Double, lng: Double, photo: String
    ) -> UserProfile {
        UserProfile(
            id: id, email: "\(first.lowercased())@escoltapro.com", role: .guardRole,
            firstName: first, lastName: last, phone: "+1-555-01\(Int.random(in: 10...99))",
            language: "en", kycStatus: "approved", isActive: true, emailVerified: true,
            createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z",
            bio: bio, hourlyRate: rate, rating: rating,
            ratingBreakdown: RatingBreakdown(professionalism: 5.0, punctuality: rating, communication: min(5.0, rating + 0.1), languageClarity: rating),
            completedJobs: jobs, certifications: certifications, languages: languages,
            photos: [photo], availability: true, isFreelancer: true,
            latitude: lat, longitude: lng, companyName: nil
        )
    }
}
