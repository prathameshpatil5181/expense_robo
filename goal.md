# AI Agent Prompt: React Native Expense Tracker (CRED-Style UI)

Copy everything below into your coding agent (Claude Code, etc.) as the initial instruction.

---

## Project Brief

Build a **React Native (Android-first)** personal expense/income tracking mobile app. The visual style must feel premium and modern, similar to the **CRED app** (https://cred.club/) — dark theme, bold typography, soft glow/gradient accents, rounded cards with subtle elevation, generous spacing, and smooth micro-animations. Avoid a generic/basic Material look; this should feel like a fintech product.

---

## 1. Tech Stack

- **Framework:** React Native (latest stable), using **Expo** (managed workflow) unless there's a strong reason to use bare RN — prefer Expo for faster setup and easier calendar/date libraries.
- **Language:** TypeScript throughout.
- **Navigation:** `@react-navigation/native` (native-stack).
- **State management:** React Context + `useReducer`, or Zustand if the agent prefers something lighter than Redux.
- **Local persistence:** `expo-sqlite` or `@react-native-async-storage/async-storage` (SQLite preferred since this is transactional financial data with future filtering/reporting needs).
- **Calendar UI:** `react-native-calendars`.
- **Icons:** `lucide-react-native` or `react-native-vector-icons`.
- **Animations:** `react-native-reanimated` for smooth transitions (bottom sheet, FAB press, list item entry).
- **Currency formatting:** format all amounts as Indian Rupees using `₹` symbol and Indian numbering (lakh/crore grouping, e.g. `₹1,25,000`).

---

## 2. Design System (CRED-inspired)

Set up a shared design system/theme file before building screens:

- **Theme:** Dark mode by default (near-black background `#0B0B0F` or similar), with card surfaces slightly lighter (`#17171C`) and layered elevation via subtle borders/shadows rather than flat Material shadows.
- **Accent colors:** Use a distinct accent for income (e.g. neon green `#3DDC97`) and a distinct accent for expense (e.g. coral/red `#FF5C5C` or amber). Use gradients sparingly on key elements (FAB, header, balance card).
- **Typography:** Bold, condensed/geometric sans-serif headings (e.g. "Poppins", "Inter", or "Sora" via `expo-font`); numbers should be tabular/monospaced-looking and large for amounts.
- **Cards:** Rounded corners (16–20px radius), soft inner padding, faint border or gradient border, slight shadow/glow.
- **Motion:** Subtle scale/opacity transitions on tap, bottom sheet slide-up for "add new item," FAB with a soft pulsing glow.
- **Iconography:** Minimal line icons, consistent stroke width.

Create this as a reusable `theme.ts` (colors, spacing, radii, typography scale) that all screens import from — don't hardcode styles per screen.

---

## 3. App Structure / Screens

### 3.1 Home Screen

Requirements:
1. Top area shows a **date/period context** (e.g. "Today" / selected date) and a **calendar icon** in the header that opens a calendar picker (using `react-native-calendars`) — selecting a date filters the list to that date instantly.
2. Two clearly separated sections:
   - **Expenses** section
   - **Income** section
3. Each section is a list of entries. Each list item shows:
   - Name (of the expense/income item)
   - Amount in ₹ (color-coded: red/coral for expense, green for income)
   - A subtle indicator/badge for paid/received status (e.g. small "Paid" / "Pending" or "Received" / "Pending" tag)
4. Optionally show a **summary/balance card** at the very top (total income − total expense for the selected date/period) — this fits the CRED aesthetic well (a hero balance card), but confirm this is wanted before over-building it.
5. A **floating action button (+)** fixed at the bottom center of the screen, elevated above the content, with a glow/shadow, opens the "Add New Item" screen (or a bottom sheet) when tapped.
6. Empty states: if no expenses or no income exist for a date, show a friendly empty message/illustration instead of a blank list.

### 3.2 Add New Item Screen (or Bottom Sheet)

Fields:
1. **Type toggle:** Expense / Income (segmented control at the top, styled like a pill switch) — this determines which section the entry appears in and which downstream field/label is shown.
2. **Date** — date picker, defaults to today, but editable.
3. **Name** — text input (e.g. "Groceries", "Salary").
4. **Amount** — numeric input, ₹ symbol prefixed, large prominent field.
5. **Comment** — optional multi-line text input for notes.
6. **Checkbox:**
   - If type = Expense → checkbox labeled **"Paid"**.
   - If type = Income → checkbox labeled **"Received"**.
7. **Save button** — full-width, gradient/accent-colored, bottom-anchored.
8. Basic validation: name and amount required; amount must be a valid positive number.

### 3.3 Navigation Flow

- Home → tap "+" → Add New Item screen → Save → return to Home with the new item inserted in the correct section and, if it matches the currently selected date/filter, visible immediately.
- Home → tap calendar icon → calendar modal → pick date → Home list filters to that date.
- Tapping an existing list item on Home opens the same Add/Edit form pre-filled, allowing edit or delete.

---

## 4. Data Model

```ts
type EntryType = "expense" | "income";

interface Entry {
  id: string;            // uuid
  type: EntryType;
  name: string;
  amount: number;        // store as number, format for display
  date: string;           // ISO date string (YYYY-MM-DD)
  comment?: string;
  status: boolean;        // paid (expense) / received (income)
  createdAt: string;
  updatedAt: string;
}
```

Persist entries locally (SQLite table `entries`). Provide a data-access layer (`db.ts` or `entriesRepository.ts`) with functions: `addEntry`, `updateEntry`, `deleteEntry`, `getEntriesByDate`, `getEntriesInRange`, `getAllEntries`.

---

## 5. Functional Requirements Checklist

- [ ] Dark, CRED-styled theme system set up first, before screens
- [ ] Home screen with Expense + Income sections
- [ ] List items show name, ₹ amount, paid/received status
- [ ] Calendar icon in header opens date picker; selecting date filters list
- [ ] Centered floating "+" button, always accessible
- [ ] Add New Item screen/sheet: type toggle, date, name, amount, comment, paid/received checkbox
- [ ] Form validation
- [ ] Local persistence (entries survive app restart)
- [ ] Edit/delete existing entries
- [ ] Empty states for no data
- [ ] Smooth transitions/animations (FAB, bottom sheet, list insert)

---

## 6. Non-Functional Notes

- Target **Android** first (test with Expo Go / Android emulator); keep code portable to iOS but don't spend extra effort on iOS-specific polish unless asked.
- Keep components modular: `components/`, `screens/`, `theme/`, `db/`, `types/`, `navigation/`.
- Add basic TypeScript types everywhere; no `any`.
- Include a `README.md` with setup/run instructions (`expo start`, how to run on Android).

---

## 7. Suggested Build Order (tell the agent to follow this sequence)

1. Scaffold Expo TypeScript project + navigation skeleton.
2. Build theme system (colors, typography, spacing).
3. Build SQLite data layer + types.
4. Build Home screen UI with mock data first (no persistence).
5. Build Add New Item screen/sheet UI.
6. Wire Add New Item → persistence → Home refresh.
7. Add calendar filter.
8. Add edit/delete flow.
9. Polish animations, empty states, and CRED-style visual details last.

---

### Optional Enhancements (mention only if you want the agent to consider them, not required for v1)
- Monthly summary/analytics screen with charts.
- Category tags per expense (food, travel, bills, etc.).
- Search/filter by name.
- Export data as CSV.