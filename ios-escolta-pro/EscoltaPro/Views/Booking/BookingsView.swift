import SwiftUI

/// Booking history list mirroring expo/app/(tabs)/bookings.tsx: status badges,
/// date/pickup/amount rows, empty state per role.
struct BookingsView: View {
    let user: UserProfile

    @State private var bookingService = BookingService.shared
    @State private var selectedBooking: Booking?

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    header
                    if bookingService.isLoading && bookingService.bookings.isEmpty {
                        Spacer()
                        ProgressView()
                            .tint(AppColors.gold)
                        Text("Loading bookings...")
                            .font(.system(size: 13))
                            .foregroundStyle(AppColors.textSecondary)
                            .padding(.top, 10)
                        Spacer()
                    } else if bookingService.bookings.isEmpty {
                        Spacer()
                        EmptyStateView(
                            icon: "calendar",
                            title: "No bookings yet",
                            subtitle: user.role == .client
                                ? "Book your first protector to get started"
                                : "Accept jobs to see them here"
                        )
                        Spacer()
                    } else {
                        bookingList
                    }
                }
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

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(user.role == .client ? "My Bookings" : "Job History")
                .font(.system(size: 28, weight: .bold, design: .serif))
                .foregroundStyle(AppColors.textPrimary)
            Text("\(bookingService.bookings.count) total")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppMetrics.padding)
        .padding(.top, 12)
        .padding(.bottom, 16)
    }

    private var bookingList: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                ForEach(bookingService.bookings) { bookingItem in
                    BookingCard(booking: bookingItem)
                        .onTapGesture { selectedBooking = bookingItem }
                }
            }
            .padding(.horizontal, AppMetrics.padding)
            .padding(.bottom, 110)
        }
    }
}

/// Compact booking summary card.
struct BookingCard: View {
    let booking: Booking

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                StatusBadge(status: booking.status)
                Spacer()
                Text("#\(booking.id.prefix(8))")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.textTertiary)
            }
            DetailRow(icon: "calendar", text: "\(booking.scheduledDate) at \(booking.scheduledTime)")
            DetailRow(icon: "mappin.and.ellipse", text: booking.pickupAddress)
            HStack {
                DetailRow(icon: "clock", text: "\(booking.duration) hours")
                Spacer()
                Text(PaymentService.formatMXN(booking.totalAmount))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(AppColors.gold)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }
}
