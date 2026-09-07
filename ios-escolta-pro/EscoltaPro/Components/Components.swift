import SwiftUI

/// Primary gold call-to-action button with press feedback and loading state.
struct GoldButton: View {
    let title: String
    var icon: String? = nil
    var isLoading = false
    var isDisabled = false
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button {
            action()
        } label: {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(AppColors.background)
                } else if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(AppColors.background)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(AppColors.goldGradient)
            .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
            .opacity(isPressed || isDisabled ? 0.7 : 1)
            .scaleEffect(isPressed ? 0.97 : 1)
        }
        .disabled(isLoading || isDisabled)
        .buttonStyle(PressableButtonStyle())
    }
}

struct PressableButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

/// Colored status chip matching expo bookings screen color mapping.
struct StatusBadge: View {
    let status: BookingStatus

    private var color: Color {
        switch status {
        case .completed: AppColors.success
        case .active: AppColors.info
        case .accepted: AppColors.warning
        case .cancelled: AppColors.error
        default: AppColors.textSecondary
        }
    }

    var body: some View {
        Text(status.rawValue.uppercased().replacingOccurrences(of: "_", with: " "))
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(color.opacity(0.15))
            .clipShape(.rect(cornerRadius: 6))
    }
}

/// Gold star rating display.
struct StarRatingView: View {
    let rating: Double
    var size: CGFloat = 14
    var showsValue = true

    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: "star.fill")
                .font(.system(size: size))
                .foregroundStyle(AppColors.gold)
            if showsValue {
                Text(String(format: "%.1f", rating))
                    .font(.system(size: size + 1, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
    }
}

/// Circular avatar: photo when available, gold initials otherwise.
struct AvatarView: View {
    let name: String
    var photoURL: String?
    var size: CGFloat = 48

    var body: some View {
        Group {
            if let photoURL, let url = URL(string: photoURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().aspectRatio(contentMode: .fill)
                    default:
                        initialsView
                    }
                }
            } else {
                initialsView
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
    }

    private var initialsView: some View {
        ZStack {
            AppColors.surfaceLight
            Text(initials)
                .font(.system(size: size * 0.36, weight: .bold))
                .foregroundStyle(AppColors.gold)
        }
    }

    private var initials: String {
        let parts = name.split(separator: " ")
        let first = parts.first?.first.map(String.init) ?? ""
        let last = parts.count > 1 ? parts.last?.first.map(String.init) ?? "" : ""
        return (first + last).uppercased()
    }
}

/// Empty state placeholder with icon, title and subtitle.
struct EmptyStateView: View {
    let icon: String
    let title: String
    var subtitle: String? = nil

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 56))
                .foregroundStyle(AppColors.textTertiary)
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(AppColors.textPrimary)
            if let subtitle {
                Text(subtitle)
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}

/// Section title used across forms and detail screens.
struct SectionHeader: View {
    let title: String

    var body: some View {
        Text(title.uppercased())
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(AppColors.textSecondary)
            .tracking(1.2)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Detail row with leading SF Symbol icon.
struct DetailRow: View {
    let icon: String
    let text: String
    var iconColor: Color = AppColors.textSecondary

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(iconColor)
                .frame(width: 20)
            Text(text)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(1)
        }
    }
}

/// Dark styled text field used in forms.
struct GoldTextField: View {
    let placeholder: String
    @Binding var text: String
    var isSecure = false
    var keyboard: UIKeyboardType = .default

    var body: some View {
        Group {
            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
                    .keyboardType(keyboard)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }
        }
        .font(.system(size: 16))
        .foregroundStyle(AppColors.textPrimary)
        .padding(14)
        .background(AppColors.surface)
        .clipShape(.rect(cornerRadius: AppMetrics.smallRadius))
        .overlay(
            RoundedRectangle(cornerRadius: AppMetrics.smallRadius)
                .stroke(AppColors.border, lineWidth: 1)
        )
    }
}
