import SwiftUI

/// Braintree sandbox payment sheet mirroring expo components/PaymentSheet.tsx:
/// booking summary, sandbox test card pre-filled, processing + success states.
struct PaymentSheetView: View {
    let booking: Booking
    let guardItem: UserProfile

    @Environment(\.dismiss) private var dismiss
    @State private var cardNumber = "4111 1111 1111 1111"
    @State private var expiry = "12/26"
    @State private var cvv = "123"
    @State private var isProcessing = false
    @State private var isSuccess = false
    @State private var errorMessage: String?
    @State private var bookingService = BookingService.shared

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 18) {
                    if isSuccess {
                        successView
                    } else {
                        summaryCard
                        cardForm
                        if let errorMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundStyle(AppColors.error)
                                Text(errorMessage)
                                    .font(.system(size: 13))
                                    .foregroundStyle(AppColors.textPrimary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(AppColors.error.opacity(0.12))
                            .clipShape(.rect(cornerRadius: 10))
                        }
                        GoldButton(title: "Pay \(PaymentService.formatMXN(booking.totalAmount))", icon: "lock.fill", isLoading: isProcessing) {
                            Task { await pay() }
                        }
                    }
                }
                .padding(AppMetrics.padding)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Payment")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Booking Summary")
            DetailRow(icon: "shield.fill", text: guardItem.fullName, iconColor: AppColors.gold)
            DetailRow(icon: "calendar", text: "\(booking.scheduledDate) at \(booking.scheduledTime)")
            DetailRow(icon: "clock", text: "\(booking.duration) hours · \(booking.protectionType.rawValue.capitalized)")
            DetailRow(icon: "mappin.and.ellipse", text: booking.pickupAddress)
            Divider().background(AppColors.border)
            HStack {
                Text("Total")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Text(PaymentService.formatMXN(booking.totalAmount))
                    .font(.system(size: 19, weight: .heavy))
                    .foregroundStyle(AppColors.gold)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var cardForm: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                SectionHeader(title: "Card Details")
                Text("SANDBOX")
                    .font(.system(size: 10, weight: .heavy))
                    .foregroundStyle(AppColors.background)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(AppColors.warning)
                    .clipShape(.capsule)
            }
            GoldTextField(placeholder: "Card number", text: $cardNumber, keyboard: .numberPad)
            HStack(spacing: 14) {
                GoldTextField(placeholder: "MM/YY", text: $expiry, keyboard: .numberPad)
                GoldTextField(placeholder: "CVV", text: $cvv, keyboard: .numberPad)
            }
            Text("Test card 4111 1111 1111 1111 · any future expiry · CVV 123")
                .font(.system(size: 11))
                .foregroundStyle(AppColors.textTertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var successView: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(AppColors.success)
            Text("Payment Successful")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(AppColors.textPrimary)
            Text("Your protection detail is confirmed.\nStart code: \(booking.startCode)")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)

            GoldButton(title: "View Booking", icon: "calendar.badge.checkmark") {
                dismiss()
            }
            .padding(.top, 12)
        }
        .padding(.top, 60)
    }

    private func pay() async {
        isProcessing = true
        errorMessage = nil
        defer { isProcessing = false }

        do {
            let cleanCard = cardNumber.replacingOccurrences(of: " ", with: "")
            let transactionID = try await PaymentService.processPayment(
                amount: booking.totalAmount,
                cardNumber: cleanCard
            )
            await bookingService.confirmPayment(bookingID: booking.id, transactionID: transactionID)
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                isSuccess = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
