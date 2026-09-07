import Foundation
import FirebaseAuth
import FirebaseFirestore

/// Authentication + user profile store. Mirrors expo/contexts/AuthContext:
/// signs in with Firebase Auth and loads the `users/{uid}` Firestore profile.
@MainActor
@Observable
final class AuthService {
    static let shared = AuthService()

    private(set) var user: UserProfile?
    private(set) var isRestoring = true
    private(set) var isLoading = false
    var errorMessage: String?

    var isAuthenticated: Bool { user != nil }

    private let auth = Auth.auth()
    private let db = Firestore.firestore()

    // MARK: - Session

    func restoreSession() async {
        if FirebaseBootstrap.configured, let firebaseUser = auth.currentUser {
            user = await fetchProfile(uid: firebaseUser.uid)
            if user == nil {
                // Signed in but no profile doc: fall back to a local profile.
                user = UserProfile(
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? "",
                    role: .client,
                    firstName: "",
                    lastName: "",
                    phone: "",
                    language: "en",
                    kycStatus: "pending",
                    isActive: true,
                    emailVerified: firebaseUser.isEmailVerified,
                    createdAt: ISO8601DateFormatter().string(from: .now),
                    updatedAt: ISO8601DateFormatter().string(from: .now),
                    bio: nil, hourlyRate: nil, rating: nil, ratingBreakdown: nil,
                    completedJobs: nil, certifications: nil, languages: nil,
                    photos: nil, availability: nil, isFreelancer: nil,
                    latitude: nil, longitude: nil, companyName: nil
                )
            }
        } else if !FirebaseBootstrap.configured {
            user = DemoSession.restore()
        }
        isRestoring = false
    }

    // MARK: - Sign in

    @discardableResult
    func signIn(email: String, password: String) async -> Bool {
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        let trimmedPassword = password.trimmingCharacters(in: .whitespaces)

        guard !trimmedEmail.isEmpty, !trimmedPassword.isEmpty else {
            errorMessage = "Please fill in all fields"
            return false
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        if FirebaseBootstrap.configured {
            do {
                let result = try await auth.signIn(withEmail: trimmedEmail, password: trimmedPassword)
                guard let profile = await fetchProfile(uid: result.user.uid) else {
                    errorMessage = "Signed in but no user profile found"
                    return false
                }
                user = profile
                return true
            } catch {
                errorMessage = Self.friendlyError(error)
                return false
            }
        } else {
            // Demo mode (no Firebase config in this environment)
            guard let profile = DemoSession.signIn(email: trimmedEmail, password: trimmedPassword) else {
                errorMessage = "Invalid credentials. Demo password is demo123"
                return false
            }
            user = profile
            return true
        }
    }

    // MARK: - Sign up

    @discardableResult
    func signUp(email: String, password: String, firstName: String, lastName: String, phone: String, role: UserRole) async -> Bool {
        guard !email.isEmpty, !password.isEmpty, !firstName.isEmpty, !lastName.isEmpty else {
            errorMessage = "Please fill in all required fields"
            return false
        }
        guard password.count >= 6 else {
            errorMessage = "Password must be at least 6 characters"
            return false
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let now = ISO8601DateFormatter().string(from: .now)
        var profile = UserProfile(
            id: UUID().uuidString,
            email: email,
            role: role,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            language: "en",
            kycStatus: "pending",
            isActive: true,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
            bio: nil,
            hourlyRate: role == .guardRole ? 150 : nil,
            rating: role == .guardRole ? 0 : nil,
            ratingBreakdown: nil,
            completedJobs: role == .guardRole ? 0 : nil,
            certifications: nil,
            languages: ["en"],
            photos: nil,
            availability: role == .guardRole ? true : nil,
            isFreelancer: role == .guardRole ? true : nil,
            latitude: nil,
            longitude: nil,
            companyName: role == .company ? "\(firstName) \(lastName) Security" : nil
        )

        if FirebaseBootstrap.configured {
            do {
                let result = try await auth.createUser(withEmail: email, password: password)
                profile.id = result.user.uid
                try await db.collection("users").document(profile.id).setData(profile.toDictionary())
            } catch {
                errorMessage = Self.friendlyError(error)
                return false
            }
        }

        user = profile
        return true
    }

    // MARK: - Sign out

    func signOut() {
        if FirebaseBootstrap.configured {
            try? auth.signOut()
        }
        DemoSession.clear()
        user = nil
    }

    // MARK: - Profile

    private func fetchProfile(uid: String) async -> UserProfile? {
        do {
            let snapshot = try await db.collection("users").document(uid).getDocument()
            guard let data = snapshot.data() else { return nil }
            return ModelDecoder.decode(UserProfile.self, from: data)
        } catch {
            return nil
        }
    }

    static func friendlyError(_ error: Error) -> String {
        let code = (error as NSError).code
        if let authError = error as? AuthErrorCode {
            switch authError {
            case .invalidEmail: return "Invalid email address"
            case .wrongPassword, .invalidCredential: return "Incorrect email or password"
            case .userNotFound: return "No account found for this email"
            case .tooManyRequests: return "Too many attempts. Try again later"
            case .networkError: return "Network error. Check your connection"
            default: break
            }
        }
        _ = code
        return error.localizedDescription
    }
}

// MARK: - Demo mode

/// Local demo accounts mirroring DEMO_ACCOUNTS.md, used when Firebase is not
/// configured (sandbox preview). Production builds always use Firebase.
private enum DemoSession {
    static let accounts: [UserProfile] = [
        make(id: "demo-client", email: "client@demo.com", role: .client, first: "Demo", last: "Client"),
        make(id: "demo-guard1", email: "guard1@demo.com", role: .guardRole, first: "Marcus", last: "Reed", rate: 165),
        make(id: "demo-company", email: "company@demo.com", role: .company, first: "Apex", last: "Security"),
        make(id: "demo-admin", email: "admin@demo.com", role: .admin, first: "Admin", last: "User"),
    ]

    private static func make(id: String, email: String, role: UserRole, first: String, last: String, rate: Double? = nil) -> UserProfile {
        UserProfile(
            id: id, email: email, role: role, firstName: first, lastName: last,
            phone: "+1-555-0100", language: "en", kycStatus: "approved", isActive: true,
            emailVerified: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
            bio: role == .guardRole ? "Former Army Special Forces with 10 years of executive protection experience." : nil,
            hourlyRate: rate, rating: rate != nil ? 4.9 : nil,
            ratingBreakdown: rate != nil ? RatingBreakdown(professionalism: 5.0, punctuality: 4.9, communication: 4.8, languageClarity: 4.9) : nil,
            completedJobs: rate != nil ? 142 : nil,
            certifications: rate != nil ? ["HR-218 Credential", "TCCC Certified", "Advanced Driving"] : nil,
            languages: ["en", "es"], photos: nil, availability: true, isFreelancer: role == .guardRole,
            latitude: 40.7580, longitude: -73.9855, companyName: role == .company ? "Apex Protection Group" : nil
        )
    }

    private static let storageKey = "escolta_demo_session"

    static func signIn(email: String, password: String) -> UserProfile? {
        guard password == "demo123" else { return nil }
        guard let match = accounts.first(where: { $0.email.caseInsensitiveCompare(email) == .orderedSame }) else { return nil }
        UserDefaults.standard.set(match.id, forKey: storageKey)
        return match
    }

    static func restore() -> UserProfile? {
        guard let id = UserDefaults.standard.string(forKey: storageKey) else { return nil }
        return accounts.first { $0.id == id }
    }

    static func clear() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }
}
