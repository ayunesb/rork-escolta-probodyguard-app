import SwiftUI

/// Guard-role home mirroring expo/app/(tabs)/home.tsx guard branch:
/// earnings header and pending job cards with accept/reject.
struct GuardJobsView: View {
    let user: UserProfile

    @State private var bookingService = BookingService.shared
    @State private var selectedBooking: Booking?

    private var pendingJobs: [Booking] {
        bookingService.bookings.filter { $0.status == .pending }
    }

    private var activeJobs: [Booking] {
        bookingService.bookings.filter { [.accepted, .enRoute, .active].contains($0.status) }
    }

    private var completedPayout: Double {
        bookingService.bookings.filter { $0.status == .completed }.reduce(0) { $0 + $1.guardPayout }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 18) {
                        earningsHeader

                        if !activeJobs.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                SectionHeader(title: "Active Details")
                                ForEach(activeJobs) { job in
                                    JobCard(booking: job, isPending: false)
                                        .onTapGesture { selectedBooking = job }
                                }
                            }
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            SectionHeader(title: "Available Jobs")
                            if bookingService.isLoading && bookingService.bookings.isEmpty {
                                ProgressView()
                                    .tint(AppColors.gold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 40)
                            } else if pendingJobs.isEmpty {
                                EmptyStateView(
                                    icon: "shield",
                                    title: "No jobs available",
                                    subtitle: "Check back soon for new protection assignments"
                                )
                            } else {
                                ForEach(pendingJobs) { job in
                                    JobCard(booking: job, isPending: true)
                                        .onTapGesture { selectedBooking = job }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.bottom, 110)
                }
                .scrollBounceBehavior(.basedOnSize)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(item: $selectedBooking) { bookingItem in
                BookingDetailView(booking: bookingItem, user: user)
            }
        }
        .onAppear {
            bookingService.startListening(role: user.role, uid: user.id)
        }
        .onDisappear {
            bookingService.stopListening()
        }
    }

    private var earningsHeader: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Available Jobs")
                .font(.system(size: 28, weight: .bold, design: .serif))
                .foregroundStyle(AppColors.textPrimary)
            HStack(spacing: 14) {
                Label("\(pendingJobs.count) pending", systemImage: "tray.full")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.textSecondary)
                Label("\(activeJobs.count) active", systemImage: "shield.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.gold)
                Label("Lifetime \(PaymentService.formatMXN(completedPayout))", systemImage: "banknote")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.success)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 12)
    }
}

/// Pending/active job card for the guard home.
struct JobCard: View {
    let booking: Booking
    let isPending: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                if isPending {
                    Text("NEW JOB")
                        .font(.system(size: 10, weight: .heavy))
                        .foregroundStyle(AppColors.background)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(AppColors.gold)
                        .clipShape(.capsule)
                } else {
                    StatusBadge(status: booking.status)
                }
                Spacer()
                Text("#\(booking.id.prefix(8))")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.textTertiary)
            }
            DetailRow(icon: "calendar", text: "\(booking.scheduledDate) at \(booking.scheduledTime)")
            DetailRow(icon: "mappin.and.ellipse", text: booking.pickupAddress)
            DetailRow(icon: "clock", text: "\(booking.duration) hours · \(booking.protectionType.rawValue) · \(booking.vehicleType.rawValue)")
            HStack {
                DetailRow(icon: "banknote", text: PaymentService.formatMXN(booking.guardPayout), iconColor: AppColors.gold)
                Spacer()
                HStack(spacing: 4) {
                    Text(isPending ? "View Details" : "Manage")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(AppColors.gold)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(AppColors.gold)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}
