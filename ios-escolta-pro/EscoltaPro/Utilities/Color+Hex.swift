import SwiftUI

extension Color {
    /// Creates a color from an RGB hex string (e.g. "D4AF37").
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)

        let red, green, blue: Double
        switch cleaned.count {
        case 6:
            red = Double((value >> 16) & 0xFF) / 255.0
            green = Double((value >> 8) & 0xFF) / 255.0
            blue = Double(value & 0xFF) / 255.0
        default:
            red = 1
            green = 1
            blue = 1
        }
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: 1)
    }
}
