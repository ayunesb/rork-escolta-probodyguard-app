import SwiftUI

/// Role-based tab shell mirroring expo/app/(tabs)/_layout.tsx with a custom
/// dark + gold tab bar and a central SOS panic button.
struct MainTabView: View {
    let user: UserProfile

    enum Tab: Hashable {
        case home, bookings, profile
        case companyGuards, adminUsers
    }

    @State private var selection: Tab = .home
    @State private var showPanic = false
    @State private var booking = BookingService.shared

    var body: some View {
        ZStack(alignment: .bottom) {
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            tabBar
        }
        .ignoresSafeArea(.keyboard)
        .background(AppColors.background)
        .sheet(isPresented: $showPanic) {
            PanicSheet()
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .onChange(of: user.id) { _, _ in
            selection = .home
        }
    }

    // MARK: - Content

    @ViewBuilder
    private var content: some View {
        switch selection {
        case .home:
            if user.role == .guardRole {
                GuardJobsView(user: user)
            } else if user.role == .company {
                CompanyHomeView(user: user)
            } else if user.role == .admin {
                AdminHomeView(user: user)
            } else {
                HomeView()
            }
        case .bookings:
            BookingsView(user: user)
        case .companyGuards:
            CompanyGuardsView(user: user)
        case .adminUsers:
            AdminUsersView(user: user)
        case .profile:
            ProfileView(user: user)
        }
    }

    // MARK: - Tab bar

    private var tabBar: some View {
        HStack(spacing: 0) {
            tabButton(.home, icon: user.role == .guardRole ? "briefcase" : (user.role == .admin ? "chart.bar" : (user.role == .company ? "building.2" : "house.fill")))
            tabButton(.bookings, icon: "calendar")
            panicButton
            if user.role == .company {
                tabButton(.companyGuards, icon: "person.2")
            }
            if user.role == .admin {
                tabButton(.adminUsers, icon: "person.3")
            }
            tabButton(.profile, icon: "person.crop.circle")
        }
        .padding(.top, 10)
        .padding(.bottom, 4)
        .background(
            Rectangle()
                .fill(AppColors.surface)
                .overlay(Rectangle().stroke(AppColors.border, lineWidth: 1).blur(radius: 0.5))
                .ignoresSafeArea(edges: .bottom)
        )
    }

    private func tabButton(_ tab: Tab, icon: String) -> some View {
        Button {
            selection = tab
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Capsule()
                    .fill(AppColors.gold)
                    .frame(width: 18, height: 3)
                    .opacity(selection == tab ? 1 : 0)
            }
            .foregroundStyle(selection == tab ? AppColors.gold : AppColors.textTertiary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var panicButton: some View {
        Button {
            showPanic = true
        } label: {
            ZStack {
                Circle()
                    .fill(AppColors.error)
                    .frame(width: 54, height: 54)
                    .shadow(color: AppColors.error.opacity(0.5), radius: 10)
                Image(systemName: "siren")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(.white)
            }
        }
        .frame(maxWidth: .infinity)
        .buttonStyle(PressableButtonStyle())
        .accessibilityLabel("Emergency SOS")
    }
}

/// SOS confirmation sheet (mirrors expo components/PanicButton.tsx).
struct PanicSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var countdown = 5
    @State private var isArmed = false
    @State private var timer: Timer?

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(AppColors.error.opacity(0.15))
                        .frame(width: 110, height: 110)
                        .scaleEffect(isArmed ? 1.08 : 1.0)
                        .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: isArmed)
                    Image(systemName: "siren")
                        .font(.system(size: 44, weight: .bold))
                        .foregroundStyle(AppColors.error)
                }
                .padding(.top, 32)

                Text(isArmed ? "Emergency alert sent" : "Emergency SOS")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(AppColors.textPrimary)

                Text(isArmed
                     ? "Your location has been shared with your protection team and emergency contacts."
                     : "This alerts your protection team and shares your live location. Alert sends in \(countdown)s.")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                Spacer()

                if !isArmed {
                    GoldButton(title: "Cancel", icon: "xmark") {
                        timer?.invalidate()
                        dismiss()
                    }
                    .background(AppColors.surface)
                } else {
                    Text("Stay safe. Help is on the way.")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.success)
                        .padding(.bottom, 24)
                }
            }
        }
        .onAppear {
            timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
                Task { @MainActor in
                    if countdown > 0 {
                        countdown -= 1
                    } else if !isArmed {
                        isArmed = true
                        timer?.invalidate()
                    }
                }
            }
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
}
