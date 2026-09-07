import SwiftUI

/// Booking chat mirroring expo/app/booking-chat.tsx: gold bubbles for the
/// current user, dark bubbles for the other party, Firestore-backed.
struct ChatView: View {
    let booking: Booking

    @State private var chat = ChatService.shared
    @State private var auth = AuthService.shared
    @State private var draft = ""

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            VStack(spacing: 0) {
                if chat.messages.isEmpty {
                    Spacer()
                    EmptyStateView(icon: "message", title: "No messages yet", subtitle: "Say hello to your protection team")
                    Spacer()
                } else {
                    messageList
                }
                inputBar
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Detail Chat")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.textPrimary)
            }
        }
        .onAppear {
            chat.listen(bookingID: booking.id)
        }
        .onDisappear {
            chat.stopListening()
        }
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 10) {
                    ForEach(chat.messages) { message in
                        ChatBubble(
                            message: message,
                            isMine: message.senderId == auth.user?.id
                        )
                        .id(message.id)
                    }
                }
                .padding(AppMetrics.padding)
            }
            .onChange(of: chat.messages.count) { _, _ in
                if let last = chat.messages.last {
                    withAnimation {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }
        }
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Message...", text: $draft, axis: .vertical)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(AppColors.surface)
                .clipShape(.rect(cornerRadius: 20))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(AppColors.border, lineWidth: 1)
                )

            Button {
                let text = draft
                draft = ""
                Task {
                    if let user = auth.user {
                        await chat.send(text: text, bookingID: booking.id, sender: user)
                    }
                }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(AppColors.goldGradient)
            }
            .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(AppColors.surface)
    }
}

/// Single chat bubble.
struct ChatBubble: View {
    let message: ChatMessage
    let isMine: Bool

    var body: some View {
        HStack {
            if isMine { Spacer(minLength: 60) }
            VStack(alignment: .leading, spacing: 4) {
                Text(message.text)
                    .font(.system(size: 15))
                    .foregroundStyle(isMine ? AppColors.background : AppColors.textPrimary)
                Text(message.sentAt.formatted(date: .omitted, time: .shortened))
                    .font(.system(size: 10))
                    .foregroundStyle(isMine ? AppColors.background.opacity(0.6) : AppColors.textTertiary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(isMine ? AnyShapeStyle(AppColors.goldGradient) : AnyShapeStyle(AppColors.surfaceLight))
            .clipShape(.rect(cornerRadius: 16))
            if !isMine { Spacer(minLength: 60) }
        }
    }
}
