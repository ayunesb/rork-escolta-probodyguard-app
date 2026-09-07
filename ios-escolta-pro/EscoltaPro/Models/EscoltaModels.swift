import Foundation

// MARK: - Shared enums (mirror expo/types/index.ts)

nonisolated enum UserRole: String, Codable, Sendable, CaseIterable {
    case client
    case guardRole = "guard"
    case company
    case admin

    var displayName: String {
        switch self {
        case .client: "Client"
        case .guardRole: "Bodyguard"
        case .company: "Company"
        case .admin: "Admin"
        }
    }
}

nonisolated enum BookingStatus: String, Codable, Sendable {
    case pending, confirmed, accepted, rejected
    case enRoute = "en_route"
    case active, completed, cancelled
}

nonisolated enum VehicleType: String, Codable, Sendable, CaseIterable {
    case standard, armored
}

nonisolated enum ProtectionType: String, Codable, Sendable, CaseIterable {
    case armed, unarmed
}

nonisolated enum DressCode: String, Codable, Sendable, CaseIterable {
    case suit
    case businessCasual = "business_casual"
    case tactical, casual

    var displayName: String {
        switch self {
        case .suit: "Suit"
        case .businessCasual: "Business Casual"
        case .tactical: "Tactical"
        case .casual: "Casual"
        }
    }
}

nonisolated struct RatingBreakdown: Codable, Sendable, Hashable {
    var professionalism: Double
    var punctuality: Double
    var communication: Double
    var languageClarity: Double
}

// MARK: - User

/// Firestore `users/{uid}` document (fields shared across roles, guard extras optional).
nonisolated struct UserProfile: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var email: String
    var role: UserRole
    var firstName: String
    var lastName: String
    var phone: String
    var language: String
    var kycStatus: String
    var isActive: Bool
    var emailVerified: Bool
    var createdAt: String
    var updatedAt: String

    // Guard-only extras
    var bio: String?
    var hourlyRate: Double?
    var rating: Double?
    var ratingBreakdown: RatingBreakdown?
    var completedJobs: Int?
    var certifications: [String]?
    var languages: [String]?
    var photos: [String]?
    var availability: Bool?
    var isFreelancer: Bool?
    var latitude: Double?
    var longitude: Double?

    // Company-only extras
    var companyName: String?

    var fullName: String { "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces) }
    var initials: String {
        let first = firstName.first.map(String.init) ?? ""
        let last = lastName.first.map(String.init) ?? ""
        return (first + last).uppercased()
    }
}

// MARK: - Booking

/// Decodes a model from a Firestore/Realtime DB `[String: Any]` snapshot via
/// JSON round-tripping (no FirebaseFirestoreSwift dependency needed).
nonisolated enum ModelDecoder {
    static func decode<T: Decodable>(_ type: T.Type, from data: [String: Any]) -> T? {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: data) else { return nil }
        return try? JSONDecoder().decode(type, from: jsonData)
    }
}

nonisolated struct RouteStop: Codable, Sendable, Hashable {
    var address: String
    var latitude: Double
    var longitude: Double
    var order: Int
}

/// Firebase Realtime Database `bookings/{id}` record (mirrors the Expo Booking type).
nonisolated struct Booking: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var clientId: String
    var guardId: String?
    var companyId: String?
    var status: BookingStatus
    var bookingType: String
    var vehicleType: VehicleType
    var protectionType: ProtectionType
    var dressCode: DressCode
    var numberOfProtectees: Int
    var numberOfProtectors: Int
    var scheduledDate: String
    var scheduledTime: String
    var duration: Int
    var pickupAddress: String
    var pickupLatitude: Double
    var pickupLongitude: Double
    var pickupCity: String?
    var destinationAddress: String?
    var destinationLatitude: Double?
    var destinationLongitude: Double?
    var startCode: String
    var totalAmount: Double
    var processingFee: Double
    var platformCut: Double
    var guardPayout: Double
    var transactionId: String?
    var createdAt: String
    var startedAt: String?
    var completedAt: String?
    var cancelledAt: String?
    var cancelledBy: String?
    var cancellationReason: String?
    var rating: Double?
    var review: String?

    var statusColorName: String {
        switch status {
        case .completed: "success"
        case .active: "info"
        case .accepted: "warning"
        case .cancelled: "error"
        default: "secondary"
        }
    }
}
