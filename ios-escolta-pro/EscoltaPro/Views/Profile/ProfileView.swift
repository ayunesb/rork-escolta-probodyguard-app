import SwiftUI

/// Profile screen mirroring expo/app/(tabs)/profile.tsx: avatar, role/KYC
/// badges, settings toggles, language, sign out.
struct ProfileView: View {
    let user: UserProfile

    @State private var auth = AuthService.shared
    @State private var notificationsEnabled = true
    @State private var biometricEnabled = false
    @State private var language = "en"
    @State private var showSignOutConfirm = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 18) {
                        profileHeader
                        accountCard
                        settingsCard
                        signOutButton
                    }
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.bottom, 110)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .confirmationDialog("Sign out of Escolta Pro?", isPresented: $showSignOutConfirm, titleVisibility: .visible) {
            Button("Sign Out", role: .destructive) { auth.signOut() }
            Button("Cancel", role: .cancel) {}
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 14) {
            AvatarView(name: user.fullName, photoURL: user.photos?.first, size: 92)
            VStack(spacing: 4) {
                Text(user.fullName.isEmpty ? "Escolta Pro User" : user.fullName)
                    .font(.system(size: 22, weight: .bold, design: .serif))
                    .foregroundStyle(AppColors.textPrimary)
                Text(user.email)
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.textSecondary)
                HStack(spacing: 10) {
                    Label(user.role.displayName, systemImage: "shield.lefthalf.filled.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(AppColors.background)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(AppColors.gold)
                        .clipShape(.capsule)
                    Label("KYC \(user.kycStatus)", systemImage: "checkmark.seal")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(user.kycStatus == "approved" ? AppColors.success : AppColors.warning)
                }
                .padding(.top, 4)
            }
        }
        .padding(.top, 24)
    }

    private var accountCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Account")
            if let rate = user.hourlyRate, user.role == .guardRole {
                DetailRow(icon: "banknote", text: "Rate: \(PaymentService.formatMXN(rate))/hr", iconColor: AppColors.gold)
            }
            if let jobs = user.completedJobs, user.role == .guardRole {
                DetailRow(icon: "checkmark.seal.fill", text: "\(jobs) completed jobs")
            }
            if let company = user.companyName, user.role == .company {
                DetailRow(icon: "building.2", text: company)
            }
            DetailRow(icon: "phone", text: user.phone.isEmpty ? "No phone on file" : user.phone)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var settingsCard: some View {
        VStack(alignment: .leading, spacing: 4) {
            SectionHeader(title: "Settings")
                .padding(.bottom, 8)

            Toggle(isOn: $notificationsEnabled) {
                Label("Push notifications", systemImage: "bell.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.textPrimary)
            }
            .tint(AppColors.gold)
            .padding(.vertical, 6)

            Toggle(isOn: $biometricEnabled) {
                Label("Biometric sign-in", systemImage: "faceid")
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.textPrimary)
            }
            .tint(AppColors.gold)
            .padding(.vertical, 6)

            Divider().background(AppColors.border)

            HStack {
                Label("Language", systemImage: "globe")
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Picker("Language", selection: $language) {
                    Text("English").tag("en")
                    Text("Español").tag("es")
                    Text("Français").tag("fr")
                    Text("Deutsch").tag("de")
                }
                .tint(AppColors.gold)
            }
            .padding(.vertical, 6)

            NavigationLink {
                PrivacySettingsView()
            } label: {
                Label("Privacy settings", systemImage: "lock.shield")
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.textPrimary)
                    .padding(.vertical, 8)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var signOutButton: some View {
        Button {
            showSignOutConfirm = true
        } label: {
            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(AppColors.error)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(AppColors.error.opacity(0.1))
                .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                        .stroke(AppColors.error.opacity(0.35), lineWidth: 1)
                )
        }
        .buttonStyle(PressableButtonStyle())
    }
}

/// Privacy settings screen (expo/app/privacy-settings.tsx).
struct PrivacySettingsView: View {
    @State private var locationSharing = true
    @State private var analytics = true
    @State private var dataExportRequested = false

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 4) {
                    SectionHeader(title: "Privacy")
                        .padding(.bottom, 8)
                    Toggle(isOn: $locationSharing) {
                        Label("Share live location during details", systemImage: "location.fill")
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.textPrimary)
                    }
                    .tint(AppColors.gold)
                    .padding(.vertical, 6)
                    Toggle(isOn: $analytics) {
                        Label("Usage analytics", systemImage: "chart.bar")
                            .font(.system(size: 15))
                            .foregroundStyle(AppColors.textPrimary)
                    }
                    .tint(AppColors.gold)
                    .padding(.vertical, 6)
                    Divider().background(AppColors.border)
                    Button {
                        dataExportRequested = true
                    } label: {
                        Label(
                            dataExportRequested ? "Export requested — we'll email you" : "Export my data",
                            systemImage: "square.and.arrow.down"
                        )
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.gold)
                        .padding(.vertical, 8)
                    }
                }
                .cardStyle()
                .padding(AppMetrics.padding)
            }
        }
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
    }
}
