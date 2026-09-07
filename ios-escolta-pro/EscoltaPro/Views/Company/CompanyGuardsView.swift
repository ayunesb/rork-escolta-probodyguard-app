import SwiftUI

/// Company guard roster (expo/app/(tabs)/company-guards.tsx).
struct CompanyGuardsView: View {
    let user: UserProfile

    @State private var guards = GuardService.shared
    @State private var query = ""

    private var filtered: [UserProfile] {
        guard !query.isEmpty else { return guards.guards }
        return guards.guards.filter { $0.fullName.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()
                VStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Our Guards")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundStyle(AppColors.textPrimary)
                        Text("\(filtered.count) protection professionals")
                            .font(.system(size: 13))
                            .foregroundStyle(AppColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppMetrics.padding)
                    .padding(.top, 12)
                    .padding(.bottom, 14)

                    TextField("Search guards...", text: $query)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.textPrimary)
                        .padding(12)
                        .background(AppColors.surface)
                        .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                        .padding(.horizontal, AppMetrics.padding)
                        .padding(.bottom, 14)

                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(filtered) { guardItem in
                                GuardCard(guardItem: guardItem)
                            }
                        }
                        .padding(.horizontal, AppMetrics.padding)
                        .padding(.bottom, 110)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { await guards.loadGuards() }
    }
}
