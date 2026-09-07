import SwiftUI

/// App palette mirroring the Expo app's `constants/colors.ts`.
enum AppColors {
    static let background = Color(hex: "0A0A0A")
    static let surface = Color(hex: "1A1A1A")
    static let surfaceLight = Color(hex: "2A2A2A")
    static let gold = Color(hex: "D4AF37")
    static let goldDark = Color(hex: "B8941F")
    static let white = Color(hex: "FFFFFF")
    static let textPrimary = Color(hex: "FFFFFF")
    static let textSecondary = Color(hex: "A0A0A0")
    static let textTertiary = Color(hex: "707070")
    static let border = Color(hex: "333333")
    static let success = Color(hex: "10B981")
    static let error = Color(hex: "EF4444")
    static let warning = Color(hex: "F59E0B")
    static let info = Color(hex: "3B82F6")

    static let goldGradient = LinearGradient(
        colors: [gold, goldDark],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

/// Shared card / control metrics.
enum AppMetrics {
    static let cornerRadius: CGFloat = 16
    static let smallRadius: CGFloat = 12
    static let padding: CGFloat = 16
}

extension View {
    /// Elevated dark card used across all screens.
    func cardStyle() -> some View {
        self
            .padding(AppMetrics.padding)
            .background(AppColors.surface)
            .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
            .overlay(
                RoundedRectangle(cornerRadius: AppMetrics.cornerRadius)
                    .stroke(AppColors.border, lineWidth: 1)
            )
    }

    /// Compact chip used for filters and certifications.
    func chipStyle(isActive: Bool) -> some View {
        self
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(isActive ? AppColors.background : AppColors.textSecondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isActive ? AppColors.gold : AppColors.surface)
            .clipShape(.rect(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isActive ? AppColors.gold : AppColors.border, lineWidth: 1)
            )
    }
}
