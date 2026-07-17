# Building the Play Store AAB locally (Windows)

Your app uses **Google Play App Signing**, and past uploads were signed by EAS with an
**upload key** that EAS holds. To upload a *locally*-built AAB with **no rejection**, it must be:

1. Signed with **the same upload key EAS used** (else: "wrong signing key" rejection), and
2. Given a **versionCode higher** than your last upload (else: "version code already used").

The native project is already configured for this (gated release signing in
`android/app/build.gradle`). You only need to supply the keystore + version number.

---

## 1. Download EAS's upload keystore (do this once)

```powershell
npx eas credentials
```
- Platform → **Android**
- Build profile → **production**
- Choose **Keystore → Download** (EAS saves a `.jks` file and prints its
  **Keystore password**, **Key alias**, and **Key password**).

Move the downloaded file to: `android/app/upload.jks`
Keep the three printed secrets for the next step.

> Verify it's the right key (optional but recommended):
> ```powershell
> keytool -list -v -keystore android/app/upload.jks
> ```
> The **SHA-256** it prints must match Play Console → *Test and release → App integrity →
> Upload key certificate*. If they match, uploads will be accepted.

## 2. Find your next versionCode

Play Console → your app → **Test and release → App bundle explorer** (or the latest
closed-testing release). Note the **highest versionCode** already uploaded. Your new build
must use **that number + 1**. (Example: last was `7` → use `8`.)

## 3. Put the signing secrets where Gradle can read them

Create (or edit) **`C:\Users\Qc\.gradle\gradle.properties`** — this keeps secrets OUT of the
repo — and add:

```properties
MYAPP_UPLOAD_STORE_FILE=upload.jks
MYAPP_UPLOAD_STORE_PASSWORD=<keystore password from step 1>
MYAPP_UPLOAD_KEY_ALIAS=<key alias from step 1>
MYAPP_UPLOAD_KEY_PASSWORD=<key password from step 1>
```

(`upload.jks` is resolved relative to `android/app/`, which is where you placed it.)

## 4. Build the AAB

From the **project root**:

```powershell
cd android
./gradlew.bat clean
./gradlew.bat bundleRelease -PappVersionCode=<your new versionCode>
```

Gradle automatically runs Metro to bundle the JS **and all the audio MP3s** (Quran + Islamic
Arabic) into the bundle — no extra step needed.

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

## 5. Confirm the signature, then upload

```powershell
keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab
```
The SHA-256 must equal the **Upload key certificate** in Play Console (step 1). Then:

Play Console → **Test and release → Closed testing → your track → Create new release →**
upload `app-release.aab` → add release notes → **Save → Review → Roll out**.

---

## Notes / gotchas
- **Never** upload a build made without the `MYAPP_UPLOAD_*` properties — it would be
  debug-signed and rejected. The gradle config falls back to the debug key only for dev.
- Don't commit `android/app/upload.jks` or the passwords. Add `android/app/upload.jks` to
  `.gitignore`.
- Don't run `npx expo prebuild --clean` — it would regenerate `android/` and wipe the signing
  edits in `build.gradle`. (You don't need prebuild; `android/` is already set up.)
- `appVersionSource: remote` in `eas.json` only affects EAS cloud builds, not this local one —
  that's why you pass `-PappVersionCode` here.
- Everything else (audio, screens) is already verified: `expo export` bundles cleanly and
  `expo-doctor` passes 18/18.
```
