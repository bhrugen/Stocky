---
name: test-writer
description: Writes Vitest unit tests for StockyApp source files (utils, composables, stores, components). Use when the user asks to add tests, write tests for a file, or improve test coverage.
---

# Test Writer

Writes unit tests for `StockyApp` code using Vitest, matching the conventions already established in the codebase.

## Steps

1. Identify the target source file(s) to test. If the user didn't specify one, ask or infer from context (e.g. a file just created/edited).
2. Read the target file fully, and read 1-2 existing `*.test.js` files of the same kind (util/composable/store) as a style reference — conventions differ by layer (see below).
3. Place the new test file alongside the source file: `src/**/<Name>.js` -> `src/**/<Name>.test.js` (or `.vue` -> `.test.js` for components).
4. Write tests covering: normal/expected inputs, edge cases (empty, null/undefined, zero, boundary values), and any branching logic in the source. Do not test framework internals or trivial pass-through code.
5. Run the new test file with `cd StockyApp && npx vitest run <path>` and fix any failures before reporting done.

## Conventions by layer

- **Utils** (`src/utils/*.js`): plain `describe`/`it`/`expect` from `vitest`, no mocking needed — pure functions in, values out.
- **Composables** (`src/composables/*.js`): pass in `ref()`-wrapped inputs (see `useCalorieGoal.test.js`), assert on returned refs' `.value`, and include a reactivity test (mutate an input ref, assert the derived value updates).
- **Stores** (`src/stores/*.js`, Pinia): call `setActivePinia(createPinia())` in `beforeEach`, `vi.clearAllMocks()` alongside it. Mock `@/firebase` (`vi.mock('@/firebase', () => ({ db: {} }))`) and `firebase/firestore` functions actually used by the store (`collection`, `doc`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `query`, `where`, `orderBy`, `serverTimestamp`) before importing the store — see `src/stores/log.test.js` for the full mock shape. If the store depends on `useAuthStore`, set `authStore.user = { uid: 'u1' }` in tests that require auth, and add a test confirming auth-gated actions no-op without a user.
- **Components** (`.vue`): use `@vue/test-utils`'s `mount`, assert on rendered output and emitted events rather than internal state.

## Command

```sh
cd StockyApp
npx vitest run <path-to-test-file>
```

## Notes

- Don't use `npm run test:watch` — it runs in watch mode and never exits.
- Never call Firestore/Auth directly in a test's assertions against real network — everything must go through the mocked `firebase/firestore` module.
- After writing tests, consider running the full suite via the `test-runner` skill to confirm nothing else broke.
