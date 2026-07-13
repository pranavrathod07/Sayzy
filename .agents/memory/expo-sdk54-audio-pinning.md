---
name: Expo SDK54 audio/speech/fs pinning
description: pnpm add for expo-audio/expo-speech/expo-file-system resolves to a much newer major (e.g. 57.x) than the project's Expo SDK; must pin manually.
---

When adding `expo-speech`, `expo-audio`, or `expo-file-system` to a project pinned to Expo SDK 54 (`expo: ~54.0.27`), a plain `pnpm add <pkg>` resolves the package's *latest* major (e.g. `57.0.0`), which does not match the installed SDK and breaks at runtime/build.

**Why:** These `expo-*` packages publish independently of the `expo` umbrella package's SDK cadence. The scaffold's other `expo-*` deps are already correctly pinned (e.g. `expo-blur ~15.0.8`, `expo-font ~14.0.10`) — new additions must follow the same SDK-generation pinning or Metro/Expo Go will refuse to run cleanly.

**How to apply:** Before installing a new `expo-*` package, check `npm view <pkg> versions --json` for a version whose major roughly aligns with the SDK's known compatible line (for SDK 54: `expo-speech ~14.0.7`, `expo-audio ~1.1.1`, `expo-file-system ~19.0.16`). After installing, run `pnpm install` and check its stdout — pnpm prints a compatibility warning block like `expo-audio@1.0.16 - expected version: ~1.1.1` that tells you the exact version to pin. Do not run `npx expo install` (forbidden — it can invoke the dev-server CLI path); resolve versions manually via `npm view` + editing `package.json` + `pnpm install`.
