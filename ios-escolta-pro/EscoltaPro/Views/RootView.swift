import SwiftUI

/// Root routing, mirroring expo/app/index.tsx: splash while restoring the
/// session, then sign-in or the role-based tab shell.
struct RootView: View {
    @State private var auth = AuthService.shared

    var body: some View {
        Group {
            if auth.isRestoring {
                splash
            } else if let user = auth.user {
                MainTabView(user: user)
            } else {
                SignInView()
            }
        }
        .animation(.easeInOut(duration: 0.25), value: auth.isRestoring)
        .animation(.easeInOut(duration: 0.25), value: auth.isAuthenticated)
        .task { await auth.restoreSession() }
        .preferredColorScheme(.dark)
        .tint(AppColors.gold)
    }

    private var splash: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            VStack(spacing: 20) {
                Image(systemName: "shield.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(AppColors.goldGradient)
                    .shadow(color: AppColors.gold.opacity(0.4), radius: 18)
                Text("ESCOLTA PRO")
                    .font(.system(size: 20, weight: .heavy, design: .serif))
                    .tracking(4)
                    .foregroundStyle(AppColors.gold)
                ProgressView()
                    .tint(AppColors.gold)
            }
        }
    }
}
