---
name: test-runner
description: Runs the StockyApp unit test suite (Vitest). Use when the user asks to run tests, check if tests pass, or verify a change didn't break anything.
---

# Test Runner

Runs the unit tests for the `StockyApp` project using Vitest.

## Steps

1. From the repository root, change into the `StockyApp` directory.
2. Run `npm run test` (this executes `vitest run`, a single non-watch run).
3. Report results:
   - If all tests pass, summarize the number of test files/tests passed.
   - If any test fails, show the failing test name(s) and the relevant error output, and identify the source file likely responsible before proposing a fix.

## Command

```sh
cd StockyApp
npm run test
```

## Notes

- Do not use `npm run test:watch` here — it runs in watch mode and never exits.
- Test files live alongside source files as `*.test.js` (e.g. `src/utils/calories.test.js`, `src/stores/log.test.js`).