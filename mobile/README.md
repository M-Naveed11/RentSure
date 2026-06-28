# RentSure Mobile

React Native (bare CLI) app for RentSure — AI-powered lease analyzer for UAE tenants. Talks to the same FastAPI backend as the web app.

## Setup

```sh
npm install
node --version   # must be 20+ (Metro requires Array.prototype.toReversed)
```

If on Node 18, switch first: `nvm use 20` (see `.nvmrc`).

## Backend connection

`src/api/client.ts` points at `localhost:8000` (mapped to `10.0.2.2` for the Android emulator). Before submitting to the Play Store, update `API_URL` to the deployed backend URL (e.g. Railway).

## Run

```sh
npx react-native start          # Metro bundler
npx react-native run-android    # build + install on emulator/device
```

First build compiles native code for all linked libraries and takes ~20-30 min; subsequent JS-only changes hot-reload instantly.

## Structure

- `src/screens/` — one folder per feature (auth, dashboard, analyses, chat, documents, settings)
- `src/navigation/` — auth stack vs. tabbed app stack, switched by `AuthContext`
- `src/api/client.ts` — axios instance with JWT interceptor
- `src/context/AuthContext.tsx` — login/register/logout, token persistence via AsyncStorage
- `src/types/index.ts` — shared TypeScript types mirroring backend Pydantic schemas
