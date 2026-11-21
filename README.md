# GOVAI V1.4 – Government AI Services

A mobile-friendly, white and minimal prototype for helping users prepare for selected Zambian business and government-related services.

## New in V1.4: guided demos (wizard.js)
Three guided demos, each with **10 short questions**, a review page, and a demo result page:
- **Register a business** → demo business-name registration page
- **Register a TPIN** → demo TPIN page
- **Create a business profile** → demo business profile page

Start them from the home cards, the suggestion chips, the sidebar ("Guided demos"), or by typing/saying "register a business", "register a TPIN" or "create a business profile".

Voice: answers are read out loud (🔊 toggle at the top; the review and result pages read every answer). Tap 🎤 and say your answer, then a command: **next, back, repeat, clear, skip, read answers, create, done, stop, close**. The chat box also has a 🎤 for spoken questions.
Voice input uses the browser Speech Recognition API (works in Chrome on Android/desktop, including the installed PWA). Spoken read-out works in most browsers. Speech recognition is generally not available inside the Android APK WebView; typing, tapping and read-out still work there.

All numbers (registration number, TPIN) are randomly generated for the demo and are not real. Nothing is sent anywhere.

## Important prototype limitations
- This is an independent prototype. It is not an official Government of Zambia website and is not endorsed by PACRA, ZRA or another agency.
- PACRA and ZRA functions provide preparation guidance only. There is no live government-system integration, name-availability check, application submission, TPIN issuance or approval.
- The Business Starter Pack creates planning guidance, not guaranteed financial outcomes.
- Conversation history is stored in the current browser/device using localStorage. It does not synchronise between devices. Clearing browser data can remove it. Private browsing or storage restrictions may prevent saving.

## Run locally
Open `index.html` in a browser for a basic preview. For service-worker/PWA behaviour, serve the folder over HTTPS or localhost.

## Publish with GitHub Pages
1. Create a GitHub repository named `govai`.
2. Extract this ZIP and upload the contents of this folder (not the outer ZIP folder) to the repository root.
3. Commit to the `main` branch.
4. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
5. The included `deploy.yml` workflow publishes the root website. After the workflow succeeds, open the Pages URL shown in repository Settings → Pages.

## Build an Android APK using GitHub Actions
1. Upload the project to a GitHub repository and push to `main`.
2. Open **Actions** and run **Build GOVAI Android APK**, or push a change to the repository.
3. Wait for the workflow to finish.
4. Open the completed workflow run and download the `GOVAI-debug-APK` artifact.
5. Extract the artifact and install the debug APK on an Android device. Android may ask you to allow installation from that source.

The workflow creates the Capacitor Android project during CI. You do not need to commit generated `android/` or `www/` folders.

## Build Android locally (optional)
Requires Node.js 22, Java 21, Android SDK and Gradle-compatible Android tooling:
```bash
npm install
mkdir -p www
cp index.html style.css app.js manifest.webmanifest sw.js www/
cp -r assets www/
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Project files
- `index.html`, `style.css`, `app.js`: website interface and prototype logic
- `manifest.webmanifest`, `sw.js`: PWA metadata and offline cache
- `.github/workflows/deploy.yml`: GitHub Pages deployment
- `.github/workflows/build-apk.yml`: Android debug APK build
- `capacitor.config.json`, `package.json`: Capacitor configuration

## Production work still required
Before handling real public applications or personal information, add a secure backend, approved agency integrations, authentication and role-based access, data-protection impact assessment, privacy notice, consent flows, audit logs, encryption, backups, monitoring, rate limiting, incident response, accessibility testing and formal agency authorisation. Never put private API keys in browser JavaScript.
