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

## 4. Sync the version by hand (this project does NOT run `expo prebuild`)

Because `android/` is hand-maintained, **nothing propagates `app.config.js` into the native
project.** Three files must state the same version or the build ships with the wrong OTA runtime
version and no update can ever target it (this silently drifted to `1.3.0` while the app was
shipping as `1.4.1`):

| File | Field |
|---|---|
| `app.config.js` | `version` |
| `android/app/build.gradle` | `versionName` |
| `android/app/src/main/res/values/strings.xml` | `expo_runtime_version` |

The same applies to anything else driven by app config — permissions, `blockedPermissions`, and
the EAS Update channel meta-data in `android/app/src/main/AndroidManifest.xml`. Change it in
`app.config.js` **and** mirror it into `android/`.

## 5. Build the AAB

From the **project root**:

```powershell
cd android
./gradlew.bat clean
./gradlew.bat bundleRelease -PappVersionCode=<your new versionCode>
```

Gradle automatically runs Metro to bundle the JS **and all the audio MP3s** (Quran + Islamic
Arabic) into the bundle — no extra step needed.

> **`clean` is not optional, and it must be its OWN command.** Running
> `gradlew clean assembleRelease` in a single invocation gives Gradle no ordering guarantee between
> `clean` and the build tasks — it silently fails to clean (and breaks New Architecture codegen).
> Run `gradlew clean`, wait for it to finish, *then* run the build.

### Why this matters more than it looks: the stale `app.manifest` bug

Because `updates.enabled: true`, **`expo-asset` resolves every bundled clip through expo-updates'
embedded manifest**, `android/app/build/generated/assets/createReleaseUpdatesResources/app.manifest`
— NOT through `res/raw`. Any asset missing from that manifest resolves to an empty URI, and
expo-audio then tries to open `/`, failing with `EACCES`.

`createReleaseUpdatesResources` does **not** reliably re-run when you add audio. In the 1.4.1
release it was still the 13 July copy listing only 574 mp3s, so the Quran/Islamic clips played
while all 4,123 teacher clips silently fell back to the robotic device voice.

**Always verify the manifest before uploading:**

```powershell
# should print roughly 4209, not 574
unzip -p app-release.aab base/assets/app.manifest | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).assets.filter(a=>a.type==='mp3').length))"
```

If that number is wrong, delete
`android/app/build/generated/assets/createReleaseUpdatesResources` and
`android/app/build/intermediates/assets/release`, then rebuild.

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

## 6. Confirm the signature, then upload

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
  edits in `build.gradle`. (You don't need prebuild; `android/` is already set up.) The cost of
  that choice is step 4: **every app-config change must be mirrored into `android/` by hand.**
- **Verify the AAB before uploading.** `unzip -l app-release.aab | grep -c "res/raw/.*\.mp3"`
  should report ~4,209 audio files. Then install exactly what Play will deliver — split APKs, not
  the local APK — with
  `bundletool build-apks --bundle=app-release.aab --output=lg.apks --connected-device` followed by
  `bundletool install-apks --apks=lg.apks`. Open **Settings → Voice → Audio check** on the device:
  `Played` must equal `Attempts` and `Source` must start with `assets_audio_teacher_`.
- `appVersionSource: remote` in `eas.json` only affects EAS cloud builds, not this local one —
  that's why you pass `-PappVersionCode` here.
- Everything else (audio, screens) is already verified: `expo export` bundles cleanly and
  `expo-doctor` passes 18/18.
```
