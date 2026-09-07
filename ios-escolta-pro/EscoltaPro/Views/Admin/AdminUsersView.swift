import SwiftUI

/// Admin user directory (expo/app/(tabs)/admin-users.tsx): searchable list of
/// platform users with role and KYC badges.
struct AdminUsersView: View {
    let user: UserProfile

    @State private var guards = GuardService.shared
    @State private var query = ""

    private var users: [UserProfile] {
        let all = guards.guards
        guard !query.isEmpty else { return all }
        return all.filter {
            $0.fullName.localizedCaseInsensitiveContains(query)
                || $0.email.localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                VStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Users")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundStyle(AppColors.textPrimary)
                        Text("\(users.count) accounts")
                            .font(.system(size: 13))
                            .foregroundStyle(AppColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.top, 12)
                    .padding(.bottom, 14)

                    TextField("Search users...", text: $query)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.textPrimary)
                        .padding(12)
                        .background(AppColors.surface)
                        .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                        .padding(.horizontal, AppMetrics.padding)
                        .padding(.bottom, 14)

                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(users) { account in
                                HStack(spacing: 12) {
                                    AvatarView(name: account.fullName, photoURL: account.photos?.first, size: 44)
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(account.fullName)
                                            .font(.system(size: 15, weight: .semibold))
                                            .foregroundStyle(AppColors.textPrimary)
                                        Text(account.email)
                                            .font(.system(size: 12))
                                            .foregroundStyle(AppColors.textSecondary)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 4) {
                                        Text(account.role.displayName)
                                            .font(.system(size: 11, weight: .bold))
                                            .foregroundStyle(AppColors.gold)
                                        Text("KYC \(account.kycStatus)")
                                            .font(.system(size: 10, weight: .medium))
                                            .foregroundStyle(account.kycStatus == "approved" ? AppColors.success : AppColors.warning)
                                    }
                                }
                                .cardStyle()
                            }
                        }
                        .padding(.horizontal, AppMetrics.padding)
                        .padding(.bottom, 110)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { await guards.loadGuards() }
    }
}
