import Foundation

/// Payment pricing (mirrors expo config PAYMENT_CONFIG: 2.9% + fixed fee,
/// 15% platform cut) and Braintree sandbox transaction flow.
enum PaymentService {
    struct PaymentBreakdown: Sendable {
        let subtotal: Double
        let processingFee: Double
        let platformCut: Double
        let guardPayout: Double
        let total: Double
    }

    private static let processingFeePercent = 0.029
    private static let processingFeeFixed = 0.30
    private static let platformCutPercent = 0.15

    /// Quote breakdown for an effective hourly rate and duration.
    static func calculateBreakdown(effectiveHourlyRate: Double, duration: Int) -> PaymentBreakdown {
        let subtotal = effectiveHourlyRate * Double(duration)
        let processingFee = subtotal * processingFeePercent + processingFeeFixed
        let total = subtotal + processingFee
        let platformCut = subtotal * platformCutPercent
        let guardPayout = subtotal - platformCut
        return PaymentBreakdown(
            subtotal: subtotal,
            processingFee: processingFee,
            platformCut: platformCut,
            guardPayout: guardPayout,
            total: total
        )
    }

    /// Effective hourly rate including vehicle/armored and armed multipliers
    /// (mirrors expo booking create screen).
    static func effectiveRate(
        baseRate: Double,
        vehicleType: VehicleType,
        protectionType: ProtectionType,
        protectors: Int
    ) -> Double {
        let vehicleMultiplier = vehicleType == .armored ? 1.5 : 1.0
        let protectionMultiplier = protectionType == .armed ? 1.3 : 1.0
        return baseRate * vehicleMultiplier * protectionMultiplier * Double(protectors)
    }

    /// Charges the card through the backend Braintree endpoint when available.
    /// Falls back to a simulated sandbox approval so the flow stays testable
    /// (Braintree sandbox test card 4111 1111 1111 1111).
    static func processPayment(amount: Double, cardNumber: String) async throws -> String {
        let functionsURL = Config.EXPO_PUBLIC_RORK_FUNCTIONS_URL
        if !functionsURL.isEmpty {
            var request = URLRequest(url: URL(string: "\(functionsURL)/payments/process-card")!)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: [
                "amount": amount,
                "cardNumber": cardNumber,
                "environment": "sandbox",
            ])
            let (data, _) = try await URLSession.shared.data(for: request)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let transactionID = json["transactionId"] as? String {
                return transactionID
            }
            throw PaymentError.declined
        }

        // Demo/sandbox simulation: short delay then approval.
        try await Task.sleep(for: .seconds(1.2))
        return "bt_sandbox_\(UUID().uuidString.prefix(12))"
    }

    enum PaymentError: LocalizedError {
        case declined

        var errorDescription: String? {
            switch self {
            case .declined: "Payment declined. Please try another card."
            }
        }
    }

    /// Formats amounts as MXN (the platform currency).
    static func formatMXN(_ amount: Double) -> String {
        amount.formatted(.currency(code: "MXN"))
    }
}
