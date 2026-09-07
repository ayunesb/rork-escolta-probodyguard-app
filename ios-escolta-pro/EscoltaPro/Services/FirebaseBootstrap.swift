import Foundation
import FirebaseCore

/// Configures Firebase programmatically from the build-time config so the iOS
/// app talks to the exact same backend (Auth, Firestore, Realtime DB) as the
/// Expo app. Falls back to a bundled GoogleService-Info.plist, then to a local
/// demo mode when no Firebase config is present.
enum FirebaseBootstrap {
    private static var _isConfigured = false

    static func configure() {
        guard FirebaseApp.app() == nil else {
            _isConfigured = true
            return
        }

        let apiKey = Config.EXPO_PUBLIC_FIREBASE_API_KEY
        let projectID = Config.EXPO_PUBLIC_FIREBASE_PROJECT_ID

        if !apiKey.isEmpty, !projectID.isEmpty {
            let options = FirebaseOptions(
                googleAppID: Config.EXPO_PUBLIC_FIREBASE_APP_ID,
                gcmSenderID: Config.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
            )
            options.apiKey = apiKey
            options.projectID = projectID
            options.storageBucket = Config.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
            options.databaseURL = "https://\(projectID)-default-rtdb.firebaseio.com"
            FirebaseApp.configure(options: options)
            _isConfigured = true
        } else if Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil {
            FirebaseApp.configure()
            _isConfigured = true
        }
    }

    /// True when Firebase is available; false enables the local demo mode.
    static var configured: Bool { _isConfigured }
}
