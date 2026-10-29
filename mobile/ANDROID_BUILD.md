# Cyber Shield — Android APK / production build setup

This folder is configured for cloud builds with Expo Application Services (EAS).
Expo Go is only for previewing the app; the `preview` profile creates a standalone
Android APK that can be installed without Expo Go.

## 1. Requirements
- Node.js version supported by the project's Expo SDK
- An Expo account
- Internet access for EAS cloud builds

## 2. Install dependencies and sign in
Open PowerShell in this `mobile` folder:

```powershell
npm install
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

If `build:configure` asks to create/link an EAS project, follow its prompts. It may
add an `extra.eas.projectId` value to app configuration; keep that generated value.

## 3. Build an installable Android APK
```powershell
npx eas-cli@latest build --platform android --profile preview
```
When the build completes, EAS provides a URL to download the `.apk`. Download it
to your Android phone and install it. You do not need Expo Go for this APK.

## 4. Build for Google Play
```powershell
npx eas-cli@latest build --platform android --profile production
```
This creates an Android App Bundle (`.aab`) for Google Play submission, not a
direct-install APK.

## 5. Important: live backend
A standalone APK does not automatically make a local Flask server available online.
For features that call Flask from outside your Wi-Fi, deploy `../backend` to a
public HTTPS host and configure the mobile app to use that HTTPS API URL. Do not
ship a private LAN address such as `192.168.x.x`, or `127.0.0.1`, in a release APK.
The app's local message-analysis engine can work without Flask, but API-dependent
features need a reachable backend. Set secrets on the backend host; never commit
production secrets in `.env`.

For testing on the same Wi-Fi, use your computer's LAN IP and ensure port 5000 is
allowed through Windows Firewall. This is only a development setup, not production.

## 6. Before public release
- Change the Android package identifier only if needed before publishing.
- Add a real app icon and splash assets.
- Review camera and location permissions and their privacy disclosures.
- Use HTTPS for APIs, set production secrets, and test on physical devices.
- Verify the live SMS feature: Android restricts background SMS access and may
  require native permissions, default-SMS-role eligibility, policy compliance,
  and additional native implementation. A UI toggle alone does not provide
  system-wide SMS monitoring.
