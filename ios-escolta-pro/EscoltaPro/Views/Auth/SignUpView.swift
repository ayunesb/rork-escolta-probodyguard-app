import SwiftUI

/// Sign-up screen mirroring expo/app/auth/sign-up.tsx: role picker
/// (client / bodyguard / company) and account fields.
struct SignUpView: View {
    @State private var auth = AuthService.shared
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var role: UserRole = .client

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 24) {
                    header
                    rolePicker
                    form
                    if let error = auth.errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(AppColors.error)
                            Text(error)
                                .font(.system(size: 13))
                                .foregroundStyle(AppColors.textPrimary)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(AppColors.error.opacity(0.12))
                        .clipShape(.rect(cornerRadius: 10))
                    }
                    GoldButton(title: "Create Account", icon: "person.badge.shield.checkmark", isLoading: auth.isLoading) {
                        Task { await submit() }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 32)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Create Account")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
    }

    private var header: some View {
        VStack(spacing: 10) {
            Image(systemName: "shield.lefthalf.filled.badge.person")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.goldGradient)
            Text("Join Escolta Pro")
                .font(.system(size: 22, weight: .bold, design: .serif))
                .foregroundStyle(AppColors.textPrimary)
        }
        .padding(.top, 12)
    }

    private var rolePicker: some View {
        HStack(spacing: 10) {
            ForEach([UserRole.client, .guardRole, .company], id: \.self) { option in
                Button {
                    role = option
                } label: {
                    VStack(spacing: 8) {
                        Image(systemName: iconName(for: option))
                            .font(.system(size: 20))
                        Text(option.displayName)
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(role == option ? AppColors.background : AppColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(role == option ? AppColors.gold : AppColors.surface)
                    .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                            .stroke(role == option ? AppColors.gold : AppColors.border, lineWidth: 1)
                    )
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
    }

    private func iconName(for role: UserRole) -> String {
        switch role {
        case .client: "person"
        case .guardRole: "shield.lefthalf.filled"
        case .company: "building.2"
        case .admin: "star.circle"
        }
    }

    private var form: some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                GoldTextField(placeholder: "First name", text: $firstName)
                GoldTextField(placeholder: "Last name", text: $lastName)
            }
            GoldTextField(placeholder: "Phone", text: $phone, keyboard: .phonePad)
            GoldTextField(placeholder: "Email", text: $email, keyboard: .emailAddress)
            GoldTextField(placeholder: "Password", text: $password, isSecure: true)
            GoldTextField(placeholder: "Confirm password", text: $confirmPassword, isSecure: true)
        }
    }

    private func submit() async {
        guard password == confirmPassword else {
            auth.errorMessage = "Passwords do not match"
            return
        }
        let success = await auth.signUp(
            email: email, password: password,
            firstName: firstName, lastName: lastName,
            phone: phone, role: role
        )
        if success { dismiss() }
    }
}
