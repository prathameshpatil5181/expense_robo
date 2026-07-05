# 💸 Expense Tracker

A premium, CRED-inspired expense/income tracking app built with React Native and Expo.

## Features

- 🌙 Dark theme with CRED-style fintech aesthetic
- ➕ Add, edit, and delete expense/income entries
- 📅 Calendar-based date filtering
- 💰 Balance card with income/expense breakdown
- 🇮🇳 Indian Rupee formatting (lakh/crore grouping)
- 💾 Local SQLite persistence (data survives app restart)
- ✨ Smooth animations and micro-interactions

## Tech Stack

| Layer | Technology |
|:---|:---|
| Framework | React Native (Expo SDK 57) |
| Language | TypeScript |
| Navigation | Expo Router |
| State | Zustand |
| Database | expo-sqlite |
| Calendar | react-native-calendars |
| Icons | lucide-react-native |
| Animations | react-native-reanimated |
| Fonts | Poppins + Inter (via expo-font) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) app on your Android device (or an Android emulator)

### Installation

```bash
# Install dependencies
npm install
```

### Running the App

```bash
# Start the development server
npx expo start

# Or run directly on Android
npm run android
```

Then scan the QR code with Expo Go on your Android device, or press `a` to open in an Android emulator.

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (fonts, navigation)
│   ├── index.tsx           # Home screen
│   └── add-entry.tsx       # Add/Edit entry screen
├── components/             # Reusable UI components
│   ├── BalanceCard.tsx     # Hero balance summary card
│   ├── CalendarModal.tsx   # Date picker modal
│   ├── EmptyState.tsx      # Empty section placeholder
│   ├── EntryCard.tsx       # Entry list item card
│   ├── FAB.tsx             # Floating action button
│   ├── SectionHeader.tsx   # Section divider with badge
│   └── TypeToggle.tsx      # Expense/Income toggle
├── db/                     # Database layer
│   └── database.ts         # SQLite CRUD operations
├── store/                  # State management
│   └── store.ts            # Zustand store
├── theme/                  # Design system
│   ├── theme.ts            # Colors, typography, spacing
│   └── fonts.ts            # Font loading utility
├── types/                  # TypeScript types
│   └── types.ts            # Entry and form data types
└── utils/                  # Utilities
    └── utils.ts            # Formatting and helpers
```

## Usage

1. **Home Screen**: Shows today's entries by default with a balance summary
2. **Add Entry**: Tap the `+` button to add a new expense or income
3. **Edit Entry**: Tap any entry card to edit or delete it
4. **Filter by Date**: Tap the calendar icon to select a different date
5. **Pull to Refresh**: Pull down on the home screen to refresh entries
