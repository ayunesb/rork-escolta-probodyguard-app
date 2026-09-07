import SwiftUI

/// Company dashboard mirroring expo/app/(tabs)/company-home.tsx: fleet stats
/// and roster preview.
struct CompanyHomeView: View {
    let user: UserProfile

    @State private var guards = GuardService.shared

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 18) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.companyName ?? "Company")
                                .font(.system(size: 26, weight: .bold, design: .serif))
                                .foregroundStyle(AppColors.textPrimary)
                            Text("Operations overview")
                                .font(.system(size: 13))
                                .foregroundStyle(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 12)

                        HStack(spacing: 12) {
                            statCard("Guards", "\(guards.guards.count)", icon: "person.2.fill", color: AppColors.gold)
                            statCard("Available", "\(guards.guards.filter { $0.availability ?? false }.count)", icon: "checkmark.circle.fill", color: AppColors.success)
                        }

                        statCard(
                            "Avg Rating",
                            String(format: "%.1f", guards.guards.compactMap(\.rating).average ?? 0),
                            icon: "star.fill",
                            color: AppColors.warning
                        )

                        VStack(alignment: .leading, spacing: 12) {
                            SectionHeader(title: "Roster")
                            ForEach(guards.guards.prefix(4)) { guardItem in
                                HStack(spacing: 12) {
                                    AvatarView(name: guardItem.fullName, photoURL: guardItem.photos?.first, size: 44)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(guardItem.fullName)
                                            .font(.system(size: 15, weight: .semibold))
                                            .foregroundStyle(AppColors.textPrimary)
                                        Text(guardItem.availability ?? false ? "Available" : "Off duty")
                                            .font(.system(size: 12))
                                            .foregroundStyle(guardItem.availability ?? false ? AppColors.success : AppColors.textTertiary)
                                    }
                                    Spacer()
                                    if let rating = guardItem.rating {
                                        StarRatingView(rating: rating, size: 12)
                                    }
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                    }
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.bottom, 110)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { await guards.loadGuards() }
    }

    private func statCard(_ title: String, _ value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(color)
            Text(value)
                .font(.system(size: 24, weight: .heavy))
                .foregroundStyle(AppColors.textPrimary)
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}

private extension Array where Element == Double {
    var average: Double? {
        guard !isEmpty else { return nil }
        return reduce(0, +) / Double(count)
    }
}
