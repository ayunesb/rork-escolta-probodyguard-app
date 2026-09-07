import SwiftUI

/// Post-booking rating mirroring expo/app/booking/rate: overall stars plus
/// the four-category breakdown written to the Firestore `reviews` collection.
struct RatingView: View {
    let booking: Booking

    @Environment(\.dismiss) private var dismiss
    @State private var auth = AuthService.shared
    @State private var rating = 5.0
    @State private var professionalism = 5.0
    @State private var punctuality = 5.0
    @State private var communication = 5.0
    @State private var languageClarity = 5.0
    @State private var review = ""
    @State private var isSubmitting = false
    @State private var didSubmit = false

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 24) {
                    if didSubmit {
                        successView
                    } else {
                        header
                        overallStars
                        breakdownCard
                        reviewEditor
                        GoldButton(title: "Submit Review", icon: "star.fill", isLoading: isSubmitting) {
                            Task { await submit() }
                        }
                    }
                }
                .padding(AppMetrics.padding)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            Text("Rate Your Protection")
                .font(.system(size: 22, weight: .bold, design: .serif))
                .foregroundStyle(AppColors.textPrimary)
            Text("Booking #\(booking.id.prefix(8))")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.textSecondary)
        }
        .padding(.top, 24)
    }

    private var overallStars: some View {
        HStack(spacing: 12) {
            ForEach(1...5, id: \.self) { star in
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        rating = Double(star)
                    }
                } label: {
                    Image(systemName: star <= Int(rating) ? "star.fill" : "star")
                        .font(.system(size: 34))
                        .foregroundStyle(star <= Int(rating) ? AppColors.gold : AppColors.surfaceLight)
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .padding(.vertical, 12)
    }

    private var breakdownCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeader(title: "How did they do?")
            breakdownSlider("Professionalism", value: $professionalism)
            breakdownSlider("Punctuality", value: $punctuality)
            breakdownSlider("Communication", value: $communication)
            breakdownSlider("Language clarity", value: $languageClarity)
        }
        .cardStyle()
    }

    private func breakdownSlider(_ title: String, value: Binding<Double>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title)
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Text("\(Int(value.wrappedValue))/5")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(AppColors.gold)
            }
            Slider(value: value, in: 1...5, step: 1)
                .tint(AppColors.gold)
        }
    }

    private var reviewEditor: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionHeader(title: "Review (optional)")
            TextField("Share your experience...", text: $review, axis: .vertical)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(3...6)
                .padding(14)
                .background(AppColors.surface)
                .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                        .stroke(AppColors.border, lineWidth: 1)
                )
        }
        .cardStyle()
    }

    private var successView: some View {
        VStack(spacing: 18) {
            Image(systemName: "star.circle.fill")
                .font(.system(size: 70))
                .foregroundStyle(AppColors.goldGradient)
            Text("Thank you!")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(AppColors.textPrimary)
            Text("Your review helps other clients choose with confidence.")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
            GoldButton(title: "Done", icon: "checkmark") { dismiss() }
                .padding(.top, 10)
        }
        .padding(.top, 80)
    }

    private func submit() async {
        guard let user = auth.user else { return }
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            try await RatingsService.submit(booking: booking, client: user, submission: RatingsService.Submission(
                rating: rating,
                professionalism: professionalism,
                punctuality: punctuality,
                communication: communication,
                languageClarity: languageClarity,
                review: review
            ))
            withAnimation { didSubmit = true }
        } catch {
            // Keep the sheet open; the retry button remains available.
        }
    }
}
