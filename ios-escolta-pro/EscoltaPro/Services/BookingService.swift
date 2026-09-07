import Foundation
import FirebaseFirestore
import FirebaseDatabase

/// Booking store backed by Firebase Realtime Database (`bookings` node), the
/// same store the Expo app reads and writes. Falls back to an in-memory store
/// in demo mode.
@MainActor
@Observable
final class BookingService {
    static let shared = BookingService()

    private(set) var bookings: [Booking] = []
    private(set) var isLoading = false
    var errorMessage: String?

    private var ref: DatabaseReference?
    private var handle: DatabaseHandle?
    private var demoBookings: [Booking] = []
    private var listeningUID: String?

    // MARK: - Listening

    /// Starts a real-time subscription filtered for the given user, matching
    /// expo bookingService.subscribeToBookings role logic.
    func startListening(role: UserRole, uid: String) {
        guard listeningUID != uid else { return }
        stopListening()
        listeningUID = uid

        if FirebaseBootstrap.configured {
            let bookingsRef = Database.database(url: "https://\(Config.EXPO_PUBLIC_FIREBASE_PROJECT_ID)-default-rtdb.firebaseio.com")
                .reference(withPath: "bookings")
            ref = bookingsRef
            handle = bookingsRef.observe(.value) { [weak self] snapshot in
                let decoded = Self.decode(snapshot)
                Task { @MainActor in
                    guard let self else { return }
                    self.bookings = Self.filter(decoded, role: role, uid: uid)
                    self.isLoading = false
                }
            } withCancel: { [weak self] error in
                Task { @MainActor in
                    self?.errorMessage = error.localizedDescription
                    self?.isLoading = false
                }
            }
            isLoading = true
        } else {
            bookings = Self.filter(demoBookings, role: role, uid: uid)
        }
    }

    func stopListening() {
        if let ref, let handle {
            ref.removeObserver(withHandle: handle)
        }
        ref = nil
        handle = nil
        listeningUID = nil
    }

    private static func filter(_ all: [Booking], role: UserRole, uid: String) -> [Booking] {
        all
            .filter { booking in
                switch role {
                case .client, .company: booking.clientId == uid
                case .guardRole: booking.guardId == uid
                case .admin: true
                }
            }
            .sorted { $0.createdAt > $1.createdAt }
    }

    private static func decode(_ snapshot: DataSnapshot) -> [Booking] {
        guard let raw = snapshot.value as? [String: Any] else { return [] }
        return raw.values.compactMap { dict in
            guard let data = try? JSONSerialization.data(withJSONObject: dict),
                  let booking = try? JSONDecoder().decode(Booking.self, from: data) else { return nil }
            return booking
        }
    }

    // MARK: - Create

    /// Creates a pending booking and returns it.
    func createBooking(
        client: UserProfile,
        guardID: String,
        vehicleType: VehicleType,
        protectionType: ProtectionType,
        dressCode: DressCode,
        numberOfProtectors: Int,
        numberOfProtectees: Int,
        scheduledDate: Date,
        scheduledTime: Date,
        duration: Int,
        pickupAddress: String,
        pickupLatitude: Double,
        pickupLongitude: Double,
        destinationAddress: String?,
        breakdown: PaymentService.PaymentBreakdown
    ) async -> Booking? {
        let id = UUID().uuidString.lowercased()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm:ss"

        let booking = Booking(
            id: id,
            clientId: client.id,
            guardId: guardID,
            companyId: nil,
            status: .pending,
            bookingType: "scheduled",
            vehicleType: vehicleType,
            protectionType: protectionType,
            dressCode: dressCode,
            numberOfProtectees: numberOfProtectees,
            numberOfProtectors: numberOfProtectors,
            scheduledDate: dateFormatter.string(from: scheduledDate),
            scheduledTime: timeFormatter.string(from: scheduledTime),
            duration: duration,
            pickupAddress: pickupAddress,
            pickupLatitude: pickupLatitude,
            pickupLongitude: pickupLongitude,
            pickupCity: nil,
            destinationAddress: destinationAddress,
            destinationLatitude: nil,
            destinationLongitude: nil,
            startCode: String(format: "%06d", Int.random(in: 100_000...999_999)),
            totalAmount: breakdown.total,
            processingFee: breakdown.processingFee,
            platformCut: breakdown.platformCut,
            guardPayout: breakdown.guardPayout,
            transactionId: nil,
            createdAt: ISO8601DateFormatter().string(from: .now),
            startedAt: nil, completedAt: nil, cancelledAt: nil,
            cancelledBy: nil, cancellationReason: nil,
            rating: nil, review: nil
        )

        if FirebaseBootstrap.configured {
            do {
                let dict = try booking.toDictionary()
                try await ref?.child(id).setValue(dict)
            } catch {
                errorMessage = "Failed to create booking: \(error.localizedDescription)"
                return nil
            }
        } else {
            demoBookings.insert(booking, at: 0)
            bookings = Self.filter(demoBookings, role: client.role, uid: client.id)
        }
        return booking
    }

    // MARK: - Mutations

    func confirmPayment(bookingID: String, transactionID: String) async {
        await patch(bookingID: bookingID, fields: [
            "transactionId": transactionID,
            "status": BookingStatus.confirmed.rawValue,
        ])
    }

    func updateStatus(bookingID: String, status: BookingStatus) async {
        var fields: [String: Any] = ["status": status.rawValue]
        switch status {
        case .active: fields["startedAt"] = ISO8601DateFormatter().string(from: .now)
        case .completed: fields["completedAt"] = ISO8601DateFormatter().string(from: .now)
        case .cancelled:
            fields["cancelledAt"] = ISO8601DateFormatter().string(from: .now)
            fields["cancelledBy"] = AuthService.shared.user?.role.rawValue ?? "client"
        default: break
        }
        await patch(bookingID: bookingID, fields: fields)
    }

    func cancel(bookingID: String, reason: String = "Cancelled by client") async {
        await patch(bookingID: bookingID, fields: [
            "status": BookingStatus.cancelled.rawValue,
            "cancelledAt": ISO8601DateFormatter().string(from: .now),
            "cancelledBy": AuthService.shared.user?.role.rawValue ?? "client",
            "cancellationReason": reason,
        ])
    }

    private func patch(bookingID: String, fields: [String: Any]) async {
        if FirebaseBootstrap.configured {
            do {
                try await ref?.child(bookingID).updateChildValues(fields)
            } catch {
                errorMessage = error.localizedDescription
            }
        } else {
            if let index = demoBookings.firstIndex(where: { $0.id == bookingID }) {
                if let newStatus = fields["status"] as? String {
                    demoBookings[index].status = BookingStatus(rawValue: newStatus) ?? demoBookings[index].status
                }
                if let tx = fields["transactionId"] as? String { demoBookings[index].transactionId = tx }
                if let rating = fields["rating"] as? Double { demoBookings[index].rating = rating }
                if let review = fields["review"] as? String { demoBookings[index].review = review }
            }
            if let uid = listeningUID {
                bookings = Self.filter(demoBookings, role: AuthService.shared.user?.role ?? .client, uid: uid)
            }
        }
    }

    func booking(withID id: String) -> Booking? {
        bookings.first { $0.id == id }
    }
}

// MARK: - Codable helpers

extension Encodable {
    /// Encodes any Codable value into a `[String: Any]` dictionary for Realtime DB writes.
    func toDictionary() throws -> [String: Any] {
        let data = try JSONEncoder().encode(self)
        let object = try JSONSerialization.jsonObject(with: data, options: [])
        return (object as? [String: Any]) ?? [:]
    }
}
