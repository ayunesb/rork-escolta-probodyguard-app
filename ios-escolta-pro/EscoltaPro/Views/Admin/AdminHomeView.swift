import SwiftUI

/// Admin dashboard mirroring expo/app/(tabs)/admin-home.tsx: platform stats
/// and booking monitor.
struct AdminHomeView: View {
    let user: UserProfile

    @State private var bookingService = BookingService.shared
    @State private var guards = GuardService.shared

    private var completedRevenue: Double {
        bookingService.bookings.filter { $0.status == .completed }.reduce(0) { $0 + $1.totalAmount }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 18) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Admin Console")
                                .font(.system(size: 28, weight: .bold, design: .serif))
                                .foregroundStyle(AppColors.textPrimary)
                            Text("Platform-wide operations")
                                .font(.system(size: 13))
                                .foregroundStyle(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 12)

                        HStack(spacing: 12) {
                            statCard("Bookings", "\(bookingService.bookings.count)", icon: "calendar", color: AppColors.info)
                            statCard("Guards", "\(guards.guards.count)", icon: "shield.fill", color: AppColors.gold)
                        }
                        HStack(spacing: 12) {
                            statCard("Completed", "\(bookingService.bookings.filter { $0.status == .completed }.count)", icon: "checkmark.seal", color: AppColors.success)
                            statCard("Volume", PaymentService.formatMXN(completedRevenue), icon: "banknote", color: AppColors.warning)
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            SectionHeader(title: "Recent Activity")
                            if bookingService.bookings.isEmpty {
                                Text("No bookings on the platform yet.")
                                    .font(.system(size: 13))
                                    .foregroundStyle(AppColors.textTertiary)
                                    .padding(.vertical, 12)
                            } else {
                                ForEach(bookingService.bookings.prefix(5)) { bookingItem in
                                    HStack {
                                        StatusBadge(status: bookingItem.status)
                                        Spacer()
                                        Text("#\(bookingItem.id.prefix(8))")
                                            .font(.system(size: 12))
                                            .foregroundStyle(AppColors.textTertiary)
                                        Text(PaymentService.formatMXN(bookingItem.totalAmount))
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundStyle(AppColors.gold)
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
        .onAppear {
            bookingService.startListening(role: user.role, uid: user.id)
        }
        .onDisappear {
            bookingService.stopListening()
        }
        .task { await guards.loadGuards() }
    }

    private func statCard(_ title: String, _ value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(color)
            Text(value)
                .font(.system(size: 22, weight: .heavy))
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}
