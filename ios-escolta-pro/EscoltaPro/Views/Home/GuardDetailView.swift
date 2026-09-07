import SwiftUI
import CoreLocation

/// Guard profile + booking form, mirroring expo/app/guard-detail.tsx:
/// hero photo, stats, certifications, quote breakdown, Book Now → payment.
struct GuardDetailView: View {
    let guardItem: UserProfile

    @Environment(\.dismiss) private var dismiss
    @State private var scheduledDate = Date()
    @State private var scheduledTime = Date()
    @State private var duration = 4
    @State private var vehicleType: VehicleType = .standard
    @State private var protectionType: ProtectionType = .unarmed
    @State private var dressCode: DressCode = .suit
    @State private var protectees = 1
    @State private var protectors = 1
    @State private var pickupAddress = ""
    @State private var isLoadingLocation = false
    @State private var showPayment = false
    @State private var createdBooking: Booking?
    @State private var booking = BookingService.shared
    @State private var auth = AuthService.shared

    private var effectiveRate: Double {
        PaymentService.effectiveRate(
            baseRate: guardItem.hourlyRate ?? 150,
            vehicleType: vehicleType,
            protectionType: protectionType,
            protectors: protectors
        )
    }

    private var breakdown: PaymentService.PaymentBreakdown {
        PaymentService.calculateBreakdown(effectiveHourlyRate: effectiveRate, duration: duration)
    }

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 18) {
                    hero
                    profileCard
                    bookingForm
                    quoteCard
                    GoldButton(title: "Book Now — \(PaymentService.formatMXN(breakdown.total))", icon: "shield.fill") {
                        Task { await handleBookNow() }
                    }
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.bottom, 110)
                }
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Guard Profile")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
        .sheet(item: $createdBooking) { bookingItem in
            PaymentSheetView(booking: bookingItem, guardItem: guardItem)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Hero

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            AppColors.surfaceLight
                .frame(height: 260)
                .overlay {
                    if let photo = guardItem.photos?.first, let url = URL(string: photo) {
                        AsyncImage(url: url) { phase in
                            if let image = phase.image {
                                image.resizable().aspectRatio(contentMode: .fill)
                            }
                        }
                        .allowsHitTesting(false)
                    }
                }
                .overlay {
                    LinearGradient(
                        colors: [.clear, AppColors.background.opacity(0.9)],
                        startPoint: .center, endPoint: .bottom
                    )
                    .allowsHitTesting(false)
                }
                .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
                .padding(.horizontal, AppMetrics.padding)

            VStack(alignment: .leading, spacing: 6) {
                Text(guardItem.fullName)
                    .font(.system(size: 26, weight: .bold, design: .serif))
                    .foregroundStyle(AppColors.textPrimary)
                HStack(spacing: 14) {
                    if let rating = guardItem.rating {
                        StarRatingView(rating: rating, size: 13)
                    }
                    Label("\(guardItem.completedJobs ?? 0) jobs", systemImage: "checkmark.seal.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.textSecondary)
                    Label(guardItem.languages?.joined(separator: ", ").uppercased() ?? "EN", systemImage: "globe")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
            .padding(.horizontal, 30)
            .padding(.bottom, 14)
        }
        .padding(.top, 8)
    }

    // MARK: - Profile card

    private var profileCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "About")
            Text(guardItem.bio ?? "Professional protection specialist.")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textSecondary)

            HStack(spacing: 8) {
                ForEach(guardItem.certifications ?? [], id: \.self) { cert in
                    Text(cert)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(AppColors.gold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(AppColors.gold.opacity(0.1))
                        .clipShape(.capsule)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
        .padding(.horizontal, AppMetrics.padding)
    }

    // MARK: - Booking form

    private var bookingForm: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeader(title: "Protection Details")

            HStack {
                DatePicker("Date", selection: $scheduledDate, displayedComponents: .date)
                DatePicker("Time", selection: $scheduledTime, displayedComponents: .hourAndMinute)
            }
            .tint(AppColors.gold)

            optionRow("Vehicle", options: ["Standard", "Armored"], selection: vehicleType == .armored ? 1 : 0) { index in
                vehicleType = index == 1 ? .armored : .standard
            }
            optionRow("Protection", options: ["Unarmed", "Armed"], selection: protectionType == .armed ? 1 : 0) { index in
                protectionType = index == 1 ? .armed : .unarmed
            }

            Picker("Dress code", selection: $dressCode) {
                ForEach(DressCode.allCases, id: \.self) { code in
                    Text(code.displayName).tag(code)
                }
            }
            .pickerStyle(.segmented)
            .tint(AppColors.goldDark)

            stepperRow("Protectors", value: $protectors, range: 1...4)
            stepperRow("Protectees", value: $protectees, range: 1...10)
            stepperRow("Duration (hours)", value: $duration, range: 1...24)

            VStack(alignment: .leading, spacing: 8) {
                GoldTextField(placeholder: "Pickup address", text: $pickupAddress)
                Button {
                    Task { await useCurrentLocation() }
                } label: {
                    HStack(spacing: 6) {
                        if isLoadingLocation {
                            ProgressView().tint(AppColors.gold)
                        } else {
                            Image(systemName: "location.fill")
                        }
                        Text("Use my current location")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(AppColors.gold)
                }
            }
        }
        .cardStyle()
        .padding(.horizontal, AppMetrics.padding)
    }

    private func optionRow(_ title: String, options: [String], selection: Int, onChange: @escaping (Int) -> Void) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.textSecondary)
            Picker(title, selection: Binding(get: { selection }, set: onChange)) {
                ForEach(options.indices, id: \.self) { index in
                    Text(options[index]).tag(index)
                }
            }
            .pickerStyle(.segmented)
            .tint(AppColors.goldDark)
        }
    }

    private func stepperRow(_ title: String, value: Binding<Int>, range: ClosedRange<Int>) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textPrimary)
            Spacer()
            Stepper("", value: value, in: range)
                .labelsHidden()
                .tint(AppColors.gold)
            Text("\(value.wrappedValue)")
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(AppColors.gold)
                .frame(width: 30, alignment: .trailing)
        }
    }

    // MARK: - Quote

    private var quoteCard: some View {
        VStack(spacing: 10) {
            quoteRow("Base (\(duration)h × \(PaymentService.formatMXN(effectiveRate)))", value: breakdown.subtotal)
            quoteRow("Processing fee", value: breakdown.processingFee)
            Divider().background(AppColors.border)
            quoteRow("Total", value: breakdown.total, isBold: true)
        }
        .cardStyle()
        .padding(.horizontal, AppMetrics.padding)
    }

    private func quoteRow(_ title: String, value: Double, isBold: Bool = false) -> some View {
        HStack {
            Text(title)
                .font(.system(size: isBold ? 15 : 13, weight: isBold ? .bold : .regular))
                .foregroundStyle(isBold ? AppColors.textPrimary : AppColors.textSecondary)
            Spacer()
            Text(PaymentService.formatMXN(value))
                .font(.system(size: isBold ? 17 : 13, weight: .bold))
                .foregroundStyle(isBold ? AppColors.gold : AppColors.textPrimary)
        }
    }

    // MARK: - Actions

    private func useCurrentLocation() async {
        isLoadingLocation = true
        defer { isLoadingLocation = false }
        if let location = await LocationService.shared.requestAndGetCurrentLocation() {
            let geocoder = CLGeocoder()
            if let placemarks = try? await geocoder.reverseGeocodeLocation(location),
               let place = placemarks.first {
                let parts = [place.name, place.locality, place.administrativeArea].compactMap { $0 }
                pickupAddress = parts.joined(separator: ", ")
            }
        }
    }

    private func handleBookNow() async {
        guard let user = auth.user else { return }
        guard !pickupAddress.isEmpty else {
            booking.errorMessage = "Please enter a pickup address"
            return
        }

        let location = LocationService.shared.currentLocation
        if let created = await booking.createBooking(
            client: user,
            guardID: guardItem.id,
            vehicleType: vehicleType,
            protectionType: protectionType,
            dressCode: dressCode,
            numberOfProtectors: protectors,
            numberOfProtectees: protectees,
            scheduledDate: scheduledDate,
            scheduledTime: scheduledTime,
            duration: duration,
            pickupAddress: pickupAddress,
            pickupLatitude: location?.coordinate.latitude ?? 40.7580,
            pickupLongitude: location?.coordinate.longitude ?? -73.9855,
            destinationAddress: nil,
            breakdown: breakdown
        ) {
            createdBooking = created
        }
    }
}
