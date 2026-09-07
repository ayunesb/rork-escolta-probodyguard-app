import SwiftUI

/// Sign-in screen mirroring expo/app/auth/sign-in.tsx: gold shield logo,
/// pre-filled demo credentials, error banner, biometric quick sign-in.
struct SignInView: View {
    @State private var auth = AuthService.shared
    @State private var email = "client@demo.com"
    @State private var password = "demo123"
    @State private var showPassword = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 28) {
                        header
                        form
                        if let error = auth.errorMessage {
                            errorBanner(error)
                        }
                        signInButton
                        demoHint
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 48)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: .constant(false)) { EmptyView() }
            .navigationDestination(for: String.self) { _ in EmptyView() }
        }
    }

    private var header: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(AppColors.goldGradient)
                    .frame(width: 84, height: 84)
                    .shadow(color: AppColors.gold.opacity(0.35), radius: 20)
                Image(systemName: "shield.lefthalf.filled")
                    .font(.system(size: 38, weight: .bold))
                    .foregroundStyle(AppColors.background)
            }
            Text("ESCOLTA PRO")
                .font(.system(size: 24, weight: .heavy, design: .serif))
                .tracking(5)
                .foregroundStyle(AppColors.gold)
            Text("Elite security professionals at your service")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textSecondary)
        }
    }

    private var form: some View {
        VStack(spacing: 14) {
            GoldTextField(placeholder: "Email", text: $email, keyboard: .emailAddress)
            HStack {
                Group {
                    if showPassword {
                        TextField("Password", text: $password)
                    } else {
                        SecureField("Password", text: $password)
                    }
                }
                .font(.system(size: 16))
                .foregroundStyle(AppColors.textPrimary)

                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
            .padding(14)
            .background(AppColors.surface)
            .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
            .overlay(
                RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                    .stroke(AppColors.border, lineWidth: 1)
            )
        }
    }

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(AppColors.error)
            Text(message)
                .font(.system(size: 13))
                .foregroundStyle(AppColors.textPrimary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppColors.error.opacity(0.12))
        .clipShape(.rect(cornerRadius: 10))
    }

    private var signInButton: some View {
        VStack(spacing: 16) {
            GoldButton(title: "Sign In", icon: "shield.fill", isLoading: auth.isLoading) {
                Task { await auth.signIn(email: email, password: password) }
            }
            NavigationLink(value: "sign-up") {
                Text("Don't have an account? ")
                    .foregroundStyle(AppColors.textSecondary)
                + Text("Sign Up")
                    .foregroundStyle(AppColors.gold)
                    .fontWeight(.semibold)
            }
            .font(.system(size: 14))
        }
    }

    private var demoHint: some View {
        VStack(spacing: 6) {
            Text("Demo accounts · password demo123")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(AppColors.textTertiary)
            Text("client@demo.com · guard1@demo.com · company@demo.com · admin@demo.com")
                .font(.system(size: 11))
                .foregroundStyle(AppColors.textTertiary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }
}
