Trusted Web Activity (TWA) packaging — quick guide

This project is PWA-ready. To publish the app to Google Play as a wrapped Play Store app, use Bubblewrap to create a Trusted Web Activity.

Prerequisites
- Java JDK 11+
- Android SDK + build tools
- Node.js (for build)
- `npm run build` produces the `build/` folder hosted at an HTTPS URL
- Install Bubblewrap: `npm install -g @bubblewrap/cli`

Steps
1. Build and host your PWA on HTTPS (GitHub Pages, Netlify, Vercel). Ensure `manifest.json` and `service-worker.js` are accessible.

2. Run Bubblewrap init (replace placeholders):
```
bubblewrap init --manifest=https://your-domain/path/manifest.json --packageId=com.yourorg.digital5 --applicationName="THE DIGITAL 5"
```

3. Follow prompts to configure Digital Asset Links and app signing. Bubblewrap will generate an Android project in `./twa/`.

4. Build the AAB (recommended) or APK with Gradle:
```
cd twa
./gradlew bundleRelease   # creates an AAB in twa/app/build/outputs/bundle/release/
```

5. Test on device via `adb install` (APK) or internal testing track on Google Play Console (AAB).

Notes
- TWA requires serving over HTTPS with valid manifest `start_url` and `scope`.
- Use Bubblewrap's `generate` and `build` commands for automation.
