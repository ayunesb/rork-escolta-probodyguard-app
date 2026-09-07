import SwiftUI

/// Booking detail mirroring expo/app/booking/[id].tsx: status timeline, start
/// code, guard info, amount breakdown and status-aware actions
/// (cancel / chat / track / rate).
struct BookingDetailView: View {
    let booking: Booking
    let user: UserProfile

    @State private var bookingService = BookingService.shared
    @State private var guards = GuardService.shared
    @State private var showCancelConfirm = false
    @State private var showRating = false
    @State private var errorMessage: String?

    private var currentBooking: Booking {
        bookingService.booking(withID: booking.id) ?? booking
    }

    private var guardProfile: UserProfile? {
        currentBooking.guardId.flatMap { guards.profile(withID: $0) }
    }

    private var timelineSteps: [(String, Bool)] {
        let order: [BookingStatus] = [.pending, .confirmed, .enRoute, .active, .completed]
        let currentIndex = order.firstIndex(of: currentBooking.status)
        return order.enumerated().map { index, status in
            (status.rawValue, currentIndex.map { index <= $0 } ?? false)
        }
    }

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 18) {
                    statusCard
                    guardCard
                    detailsCard
                    amountCard
                    actionButtons
                    if let errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 13))
                            .foregroundStyle(AppColors.error)
                    }
                }
                .padding(AppMetrics.padding)
                .padding(.bottom, 110)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Booking #\(currentBooking.id.prefix(8))")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
        .confirmationDialog("Cancel this booking?", isPresented: $showCancelConfirm, titleVisibility: .visible) {
            Button("Cancel Booking", role: .destructive) {
                Task { await bookingService.cancel(bookingID: currentBooking.id) }
            }
            Button("Keep Booking", role: .cancel) {}
        }
        .sheet(isPresented: $showRating) {
            RatingView(booking: currentBooking)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Cards

    private var statusCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                StatusBadge(status: currentBooking.status)
                Spacer()
                if let started = currentBooking.startedAt, currentBooking.status == .active {
                    Text("Started \(RelativeDateTimeFormatter().localizedString(for: ISO8601DateFormatter().date(from: started) ?? .now, relativeTo: .now))")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.textSecondary)
                }
            }

            if currentBooking.status != .cancelled {
                HStack(spacing: 0) {
                    ForEach(timelineSteps.indices, id: \.self) { index in
                        let (label, reached) = timelineSteps[index]
                        VStack(spacing: 6) {
                            Circle()
                                .fill(reached ? AppColors.gold : AppColors.surfaceLight)
                                .frame(width: 12, height: 12)
                                .overlay(Circle().stroke(reached ? AppColors.goldDark : AppColors.border, lineWidth: 2))
                            Text(label.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundStyle(reached ? AppColors.gold : AppColors.textTertiary)
                        }
                        .frame(maxWidth: .infinity)
                        if index < timelineSteps.count - 1 {
                            Rectangle()
                                .fill(timelineSteps[index + 1].1 ? AppColors.gold : AppColors.border)
                                .frame(height: 2)
                                .padding(.bottom, 18)
                        }
                    }
                }
            } else if let reason = currentBooking.cancellationReason {
                Text("Cancelled · \(reason)")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.error)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var guardCard: some View {
        HStack(spacing: 14) {
            AvatarView(name: guardProfile?.fullName ?? "Protection Team", photoURL: guardProfile?.photos?.first, size: 56)
            VStack(alignment: .leading, spacing: 4) {
                Text(guardProfile?.fullName ?? "Awaiting assignment")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
                if let rating = guardProfile?.rating {
                    StarRatingView(rating: rating, size: 12)
                }
            }
            Spacer()
        }
        .cardStyle()
    }

    private var detailsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Details")
            DetailRow(icon: "calendar", text: "\(currentBooking.scheduledDate) at \(currentBooking.scheduledTime)")
            DetailRow(icon: "clock", text: "\(currentBooking.duration) hours")
            DetailRow(icon: "shield.fill", text: "\(currentBooking.protectionType.rawValue.capitalized) · \(currentBooking.vehicleType.rawValue.capitalized) vehicle")
            DetailRow(icon: "tshirt", text: currentBooking.dressCode.displayName)
            DetailRow(icon: "person.2", text: "\(currentBooking.numberOfProtectors) protectors · \(currentBooking.numberOfProtectees) protectees")
            DetailRow(icon: "mappin.and.ellipse", text: currentBooking.pickupAddress)
            if let destination = currentBooking.destinationAddress {
                DetailRow(icon: "flag.checkered", text: destination)
            }
            HStack {
                Text("Start code")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.textSecondary)
                Spacer()
                Text(currentBooking.startCode)
                    .font(.system(size: 18, weight: .heavy, design: .monospaced))
                    .foregroundStyle(AppColors.gold)
                    .tracking(3)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var amountCard: some View {
        VStack(spacing: 10) {
            amountRow("Subtotal", currentBooking.totalAmount - currentBooking.processingFee)
            amountRow("Processing fee", currentBooking.processingFee)
            Divider().background(AppColors.border)
            HStack {
                Text("Total")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Text(PaymentService.formatMXN(currentBooking.totalAmount))
                    .font(.system(size: 18, weight: .heavy))
                    .foregroundStyle(AppColors.gold)
            }
        }
        .cardStyle()
    }

    private func amountRow(_ title: String, _ value: Double) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 13))
                .foregroundStyle(AppColors.textSecondary)
            Spacer()
            Text(PaymentService.formatMXN(value))
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.textPrimary)
        }
    }

    // MARK: - Actions

    @ViewBuilder
    private var actionButtons: some View {
        VStack(spacing: 12) {
            if user.role == .guardRole, currentBooking.status == .pending {
                HStack(spacing: 12) {
                    Button {
                        Task { await bookingService.updateStatus(bookingID: currentBooking.id, status: .rejected) }
                    } label: {
                        Text("Reject")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(AppColors.error)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(AppColors.error.opacity(0.12))
                            .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                                    .stroke(AppColors.error.opacity(0.4), lineWidth: 1)
                            )
                    }
                    .buttonStyle(PressableButtonStyle())

                    GoldButton(title: "Accept Job", icon: "checkmark") {
                        Task { await bookingService.updateStatus(bookingID: currentBooking.id, status: .accepted) }
                    }
                }
            }

            if user.role == .guardRole, currentBooking.status == .accepted {
                GoldButton(title: "Start Detail", icon: "play.fill") {
                    Task { await bookingService.updateStatus(bookingID: currentBooking.id, status: .enRoute) }
                }
            }
            if user.role == .guardRole, currentBooking.status == .enRoute {
                GoldButton(title: "Arrived — Begin Protection", icon: "shield.fill") {
                    Task { await bookingService.updateStatus(bookingID: currentBooking.id, status: .active) }
                }
            }
            if user.role == .guardRole, currentBooking.status == .active {
                GoldButton(title: "Complete Detail", icon: "flag.checkered") {
                    Task { await bookingService.updateStatus(bookingID: currentBooking.id, status: .completed) }
                }
            }

            if [.confirmed, .accepted, .enRoute, .active].contains(currentBooking.status) {
                HStack(spacing: 12) {
                    if user.role == .client {
                        NavigationLink {
                            TrackingView(booking: currentBooking)
                        } label: {
                            Label("Track", systemImage: "location.fill")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(AppColors.gold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(AppColors.surface)
                                .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                                        .stroke(AppColors.border, lineWidth: 1)
                                )
                        }
                        .buttonStyle(PressableButtonStyle())
                    }

                    NavigationLink {
                        ChatView(booking: currentBooking)
                    } label: {
                        Label("Chat", systemImage: "message.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(AppColors.gold)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(AppColors.surface)
                            .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }

            if user.role == .client, [.pending, .confirmed].contains(currentBooking.status) {
                Button {
                    showCancelConfirm = true
                } label: {
                    Text("Cancel Booking")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.error)
                }
                .padding(.vertical, 6)
            }

            if user.role == .client, currentBooking.status == .completed, currentBooking.rating == nil {
                GoldButton(title: "Rate & Review", icon: "star.fill") {
                    showRating = true
                }
            }
        }
    }
}
