# Imposter Radar Tapatío

A fun Mexican-themed party game inspired by social deduction games. Find out who the imposter is!

## Features

- **Multiple Game Modes**: Play locally on one screen or use WiFi mode with each player on their own device
- **Bilingual Support**: Full Spanish and English translations
- **Character Selection**: Choose from 12 fun character avatars
- **Category Variety**: 20+ word categories from Guadalajara culture to international topics
- **Dark/Light Theme**: Automatic theme support based on system preferences
- **WhatsApp Integration**: Send role reminders directly via WhatsApp (web version)

## Project Structure

This is a monorepo powered by pnpm workspaces:

```
imposter-tapatio/
├── apps/
│   ├── web/          # React web app (Vite)
│   └── mobile/       # Expo React Native app
├── packages/
│   └── shared/       # Shared code (data, utils)
├── package.json      # Root workspace config
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install all dependencies
pnpm install
```

### Development

**Web App:**
```bash
pnpm dev
```
Opens at http://localhost:5173

**Mobile App:**
```bash
pnpm dev:mobile
```
Opens Expo dev server - scan QR code with Expo Go app

### Building

**Web:**
```bash
pnpm build
```

**Mobile (iOS):**
```bash
pnpm build:mobile:ios
```

**Mobile (Android):**
```bash
pnpm build:mobile:android
```

## Mobile App Publishing

### iOS App Store

1. Set up an Apple Developer account ($99/year)
2. Create an app in App Store Connect
3. Update `apps/mobile/app.json`:
   - Set your `bundleIdentifier`
   - Update version numbers
4. Build with EAS:
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```
5. Submit:
   ```bash
   eas submit --platform ios
   ```

### Google Play Store

1. Set up a Google Play Developer account ($25 one-time)
2. Create an app in Google Play Console
3. Update `apps/mobile/app.json`:
   - Set your `package` name
   - Update `versionCode`
4. Build with EAS:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```
5. Submit:
   ```bash
   eas submit --platform android
   ```

## Tech Stack

### Web
- React 19
- Vite 7
- React Router DOM
- PeerJS (P2P connections)

### Mobile
- Expo SDK 52
- Expo Router
- React Native
- React Native Reanimated

### Shared
- Game categories (Spanish & English)
- Character definitions
- Utility functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Made with 💚 in Guadalajara

---

**Note**: The WiFi P2P mode in the mobile app is currently under development. For full multiplayer functionality, use the web version.
