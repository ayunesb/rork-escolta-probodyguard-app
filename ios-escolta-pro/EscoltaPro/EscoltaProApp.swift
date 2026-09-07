//
//  EscoltaProApp.swift
//  EscoltaPro
//
//  Created by Rork on September 7, 2026.
//

import SwiftUI

@main
struct EscoltaProApp: App {
    init() {
        FirebaseBootstrap.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
