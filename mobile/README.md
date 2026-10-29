# Cyber Shield — Expo Go Mobile App

This folder is the mobile conversion of the existing Cyber Shield project.

## What is included

- Native React Native / Expo Go UI
- Home dashboard
- Scam Message Analyzer using the existing `scamEngine.ts`
- Risk score, classification, indicators and recommendations
- Link scanner
- QR Guard using the phone camera
- Scan history for the current app session
- Security Guide
- Existing Python Flask backend remains in `../backend`

## Run on Expo Go

Use Node.js 22.x or another version supported by the Expo SDK in use.

```powershell
cd mobile
npm install
npx expo start
```

Open **Expo Go** on your Android phone and scan the QR code shown by Expo.

If the phone cannot connect, make sure the phone and PC are on the same Wi-Fi network and run:

```powershell
npx expo start --tunnel
```

Expo SDK 57 is the current stable Expo Go SDK at the time this mobile project was prepared. Expo's current documentation lists SDK 57 and Expo Go support for it.

## Optional Python backend

The mobile message analyzer works locally, so the app can run without the backend.

For backend features:

```powershell
cd ..\backend
python app.py
```

A physical phone cannot use `127.0.0.1` to reach your PC. Use your PC's Wi-Fi IPv4 address instead, for example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api
```

Copy `.env.example` to `.env` and replace the IP with your PC's IPv4 address.

## Important

The original `frontend/` web application has NOT been deleted or replaced. It is preserved for browser use. The new `mobile/` folder is the Expo Go version.
