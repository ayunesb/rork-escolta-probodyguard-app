import SwiftUI
import MapKit

/// Live tracking map mirroring expo/app/tracking/[bookingId].tsx: route
/// polyline pickup → destination, guard pin, status and ETA strip.
struct TrackingView: View {
    let booking: Booking

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 40.7580, longitude: -73.9855),
        span: MKCoordinateSpan(latitudeDelta: 0.06, longitudeDelta: 0.04)
    )

    private var pickupCoordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: booking.pickupLatitude, longitude: booking.pickupLongitude)
    }

    private var destinationCoordinate: CLLocationCoordinate2D? {
        guard let lat = booking.destinationLatitude, let lng = booking.destinationLongitude else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lng)
    }

    private var routeCoordinates: [CLLocationCoordinate2D] {
        var points = [pickupCoordinate]
        if let destination = destinationCoordinate {
            points.append(destination)
        }
        return points
    }

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            Map(coordinateRegion: $region, showsUserLocation: true, userTrackingMode: .none)
                .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
                .padding(AppMetrics.padding)
                .padding(.bottom, 130)
                .overlay(alignment: .top) {
                    VStack(spacing: 6) {
                        Text("Protection Detail")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(AppColors.textSecondary)
                        Text(booking.status.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                            .font(.system(size: 22, weight: .bold, design: .serif))
                            .foregroundStyle(AppColors.gold)
                    }
                    .padding(14)
                    .background(AppColors.surface.opacity(0.95))
                    .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppMetrics.cornerRadius)
                            .stroke(AppColors.border, lineWidth: 1)
                    )
                    .padding(.top, 8)
                }

            VStack {
                Spacer()
                statusStrip
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Live Tracking")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
        .onAppear {
            centerOnRoute()
        }
    }

    private var statusStrip: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                mapPin(color: AppColors.gold, icon: "a.circle.fill")
                VStack(alignment: .leading, spacing: 2) {
                    Text("Pickup")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(AppColors.textTertiary)
                    Text(booking.pickupAddress)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(AppColors.textPrimary)
                        .lineLimit(1)
                }
                Spacer()
            }
            if let destination = booking.destinationAddress {
                HStack(spacing: 12) {
                    mapPin(color: AppColors.info, icon: "b.circle.fill")
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Destination")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(AppColors.textTertiary)
                        Text(destination)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(AppColors.textPrimary)
                            .lineLimit(1)
                    }
                    Spacer()
                }
            }
            Divider().background(AppColors.border)
            HStack {
                Label(
                    booking.status == .active ? "Protection in progress" : "En route to pickup",
                    systemImage: booking.status == .active ? "shield.lefthalf.filled" : "location.north.line.fill"
                )
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.gold)
                Spacer()
                Text("Start code \(booking.startCode)")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundStyle(AppColors.textSecondary)
            }
        }
        .padding(AppMetrics.padding)
        .background(AppColors.surface)
        .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
        .overlay(
            RoundedRectangle(cornerRadius: AppMetrics.cornerRadius)
                .stroke(AppColors.border, lineWidth: 1)
        )
        .padding(.horizontal, AppMetrics.padding)
        .padding(.bottom, 20)
    }

    private func mapPin(color: Color, icon: String) -> some View {
        Image(systemName: icon)
            .font(.system(size: 20))
            .foregroundStyle(color)
    }

    private func centerOnRoute() {
        let lats = routeCoordinates.map(\.latitude)
        let lngs = routeCoordinates.map(\.longitude)
        guard let minLat = lats.min(), let maxLat = lats.max(),
              let minLng = lngs.min(), let maxLng = lngs.max() else { return }
        region = MKCoordinateRegion(
            center: CLLocationCoordinate2D(
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2
            ),
            span: MKCoordinateSpan(
                latitudeDelta: max(0.02, abs(maxLat - minLat) * 1.6),
                longitudeDelta: max(0.02, abs(maxLng - minLng) * 1.6)
            )
        )
    }
}
