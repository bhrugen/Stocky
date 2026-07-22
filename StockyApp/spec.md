# Stocky — Calorie Tracker Spec

## 1. Overview

Stocky is a mobile-first web app for tracking daily calorie intake, inspired by MyFitnessPal. Users log in with Firebase Auth, then log food eaten each day across four meal sections (Breakfast, Lunch, Dinner, Snacks). Users build a personal, reusable library of food items (name + calories + serving size) and log entries against a daily calorie goal. All data is stored per-user in Firestore. A history view lets users look back at past days' totals, and a separate log lets users track body weight over time.

Out of scope for v1: macro tracking (protein/carbs/fat), exercise logging, barcode/nutrition-API search, social/sharing features, trend charts (history is list-only).

## 2. Tech Stack

- **Frontend**: Vue 3 (beta channel, per current `package.json`) + Vite — existing scaffold.
- **Routing**: Vue Router — not yet installed, needs to be added.
- **State management**: Pinia — not yet installed, needs to be added (for auth state, today's log, food library cache).
- **Auth**: Firebase Authentication (email/password minimum; social providers optional/future).
- **Database**: Firestore.
- **Styling**: Mobile-first responsive CSS (single-column layouts, large tap targets, bottom or top nav).

## 3. Data Model (Firestore)

```
users/{uid}
  email: string
  dailyCalorieGoal: number
  createdAt: timestamp

users/{uid}/foodItems/{itemId}
  name: string
  calories: number          // calories per 1 serving
  servingSize: string       // free text, e.g. "1 cup", "1/2 cup", "1 ct"
  createdAt: timestamp

users/{uid}/logEntries/{entryId}
  date: string              // "YYYY-MM-DD", user-local date
  mealType: "breakfast" | "lunch" | "dinner" | "snacks"
  itemId: string            // ref to foodItems/{itemId}
  itemName: string          // snapshot at log time
  caloriesPerServing: number // snapshot at log time
  quantity: number          // multiplier, e.g. 1, 0.5, 1.5
  calories: number          // computed = caloriesPerServing * quantity
  createdAt: timestamp

users/{uid}/weightEntries/{entryId}
  date: string              // "YYYY-MM-DD"
  weight: number
  unit: "lb" | "kg"
  createdAt: timestamp
```

Notes:
- `logEntries` are flat documents with a `date` field (queried via `where("date", "==", ...)`) rather than nested subcollections per day — simpler to query ranges for history.
- Food item name/calories are **snapshotted** into the log entry at the time it's logged, so later edits to a food item do not retroactively change past logged days.

## 4. User Flows

### 4.1 Authentication
- Sign up with email + password.
- Log in with email + password.
- Forgot password (Firebase password reset email).
- Log out.
- Unauthenticated users are redirected to the login screen for any app route.

### 4.2 Today View (home)
- Header shows current date (defaults to today; can navigate to other days via History).
- Daily summary: goal, total consumed, remaining (or over-goal indicator), shown as a progress bar/ring.
- Four meal sections (Breakfast, Lunch, Dinner, Snacks), each listing that day's logged entries (item name, serving size × quantity, calories) with a per-section subtotal.
- "Add food" action per section.
- Tapping an entry allows edit (change quantity) or delete.

### 4.3 Add Food to a Meal
- Search personal food library by name (typeahead).
- Select an existing item, enter quantity (default 1), save → creates a `logEntries` doc.
- Or, create a new food item inline (name, calories, serving size) if it doesn't exist yet, then it's immediately usable and saved to `foodItems` for future reuse.

### 4.4 Manage Food Library
- Standalone screen listing all personal food items (searchable/sortable by name).
- Edit an item's name/calories/serving size.
- Delete an item (does not remove past log entries, since they hold their own snapshot).

### 4.5 Settings / Profile
- View account email.
- Set/update daily calorie goal.
- Log out.

### 4.6 Weight Tracking
- Add a weight entry: date (defaults to today), weight value, unit.
- View weight history as a simple chronological list.

### 4.7 History
- Calendar or date-list view of past days.
- Each day shows date + total calories logged (and whether goal was met).
- Selecting a day opens that day's full meal breakdown (same layout as Today view), editable.
- Weight history shown as its own list (separate from calorie history, or a toggle/tab on the same screen).

## 5. Non-Functional Requirements

- Mobile-first: single-column layouts, touch-friendly controls, simple top or bottom navigation (Today / History / Settings).
- Firestore security rules: all reads/writes scoped to `users/{uid}` matching the authenticated user's UID; no cross-user access.
- No offline-sync requirement for v1 (Firestore's default caching is sufficient; explicit offline support is a future enhancement).

## 6. Explicitly Out of Scope for v1

- Macro tracking (protein/carbs/fat).
- Exercise/activity logging.
- Barcode scanning or third-party nutrition API integration.
- Social features (friends, sharing, feeds).
- Trend/graph charts (history is list-only).

## 7. Open Questions

- Should past-day log entries be freely editable, or should there be a cutoff (e.g. only today + yesterday editable)?
- Weight units: should the app support both lb and kg with a per-user or per-entry toggle, or fix one unit globally?
- Should the daily calorie goal be a single fixed number, or support different goals per day of week / future date-based changes?
- Do you want a minimum viable sign-up flow only (email/password), or also Google sign-in via Firebase Auth?
- Should deleting a food item be blocked/warned if it's referenced by existing log entries, or always allowed (since entries snapshot their own data)?
