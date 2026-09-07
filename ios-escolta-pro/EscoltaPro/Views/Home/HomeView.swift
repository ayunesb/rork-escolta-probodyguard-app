import SwiftUI
import MapKit

/// Client home screen mirroring expo/app/(tabs)/home.tsx: "Book Protection"
/// header, map/list toggle, armed/unarmed filters, guard cards with pins.
struct HomeView: View {
    @State private var guards = GuardService.shared
    @State private var filter: ProtectionFilter = .all
    @State private var viewMode: ViewMode = .map
    @State private var selectedGuard: UserProfile?

    enum ProtectionFilter: String, CaseIterable {
        case all = "All Protectors"
        case armed = "Armed"
        case unarmed = "Unarmed"
    }

    enum ViewMode {
        case map, list
    }

    private var filteredGuards: [UserProfile] {
        guards.guards.filter { guardItem in
            guardItem.availability ?? true
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    header
                    filters
                    if viewMode == .map {
                        mapView
                    } else {
                        guardList
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(item: $selectedGuard) { guardItem in
                GuardDetailView(guardItem: guardItem)
            }
            .task { await guards.loadGuards() }
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Book Protection")
                    .font(.system(size: 28, weight: .bold, design: .serif))
                    .foregroundStyle(AppColors.textPrimary)
                Text("Elite security professionals at your service")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.textSecondary)
            }
            Spacer()
            HStack(spacing: 6) {
                toggleButton("map", icon: "map", active: viewMode == .map) { viewMode = .map }
                toggleButton("list", icon: "list.bullet", active: viewMode == .list) { viewMode = .list }
            }
        }
        .padding(.horizontal, AppMetrics.padding)
        .padding(.top, 12)
        .padding(.bottom, 16)
    }

    private func toggleButton(_ label: String, icon: String, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(active ? AppColors.background : AppColors.textSecondary)
                .frame(width: 36, height: 32)
                .background(active ? AppColors.gold : AppColors.surface)
                .clipShape(.rect(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(active ? AppColors.gold : AppColors.border, lineWidth: 1)
                )
        }
        .accessibilityLabel("\(label) view")
    }

    // MARK: - Filters

    private var filters: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(ProtectionFilter.allCases, id: \.self) { option in
                    Button {
                        filter = option
                    } label: {
                        HStack(spacing: 6) {
                            if option != .all {
                                Image(systemName: "shield.fill")
                                    .font(.system(size: 11))
                            }
                            Text(option.rawValue)
                        }
                    }
                    .chipStyle(isActive: filter == option)
                }
            }
            .padding(.horizontal, AppMetrics.padding)
        }
        .padding(.bottom, 12)
    }

    // MARK: - Map

    private var mapView: some View {
        let center = CLLocationCoordinate2D(latitude: 40.7549, longitude: -73.9840)
        return Map(coordinateRegion: .constant(MKCoordinateRegion(
            center: center,
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.03)
        )), annotationItems: filteredGuards) { guardItem in
            MapAnnotation(coordinate: CLLocationCoordinate2D(
                latitude: guardItem.latitude ?? 40.75,
                longitude: guardItem.longitude ?? -73.98
            )) {
                Button {
                    selectedGuard = guardItem
                } label: {
                    VStack(spacing: 2) {
                        ZStack {
                            Circle()
                                .fill(AppColors.goldGradient)
                                .frame(width: 34, height: 34)
                                .shadow(color: .black.opacity(0.4), radius: 4, y: 2)
                            Image(systemName: "shield.fill")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(AppColors.background)
                        }
                        Text(guardItem.firstName)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(AppColors.textPrimary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(AppColors.surface.opacity(0.9))
                            .clipShape(.capsule)
                    }
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .clipShape(.rect(cornerRadius: AppMetrics.cornerRadius))
        .padding(.horizontal, AppMetrics.padding)
        .padding(.bottom, AppMetrics.padding)
    }

    // MARK: - List

    private var guardList: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                ForEach(filteredGuards) { guardItem in
                    GuardCard(guardItem: guardItem)
                        .onTapGesture { selectedGuard = guardItem }
                }
            }
            .padding(.horizontal, AppMetrics.padding)
            .padding(.bottom, 110)
        }
    }
}

/// Guard summary card used in the home list.
struct GuardCard: View {
    let guardItem: UserProfile

    var body: some View {
        HStack(spacing: 14) {
            AvatarView(name: guardItem.fullName, photoURL: guardItem.photos?.first, size: 64)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(guardItem.fullName)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.textPrimary)
                    Spacer()
                    if let rating = guardItem.rating {
                        StarRatingView(rating: rating)
                    }
                }
                Text(guardItem.bio ?? "Professional protection specialist")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.textSecondary)
                    .lineLimit(2)
                HStack(spacing: 12) {
                    if let rate = guardItem.hourlyRate {
                        Text(PaymentService.formatMXN(rate) + "/hr")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(AppColors.gold)
                    }
                    Label("\(guardItem.completedJobs ?? 0) jobs", systemImage: "checkmark.seal")
                        .font(.system(size: 11))
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.textTertiary)
        }
        .cardStyle()
    }
}
