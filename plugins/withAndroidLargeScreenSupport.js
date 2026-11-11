const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidLargeScreenSupport(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';
    const application = manifest.application?.[0];
    const activities = application?.activity || [];
    const mainActivity = activities.find((activity) =>
      activity['intent-filter']?.some((filter) =>
        filter.action?.some((action) => action.$?.['android:name'] === 'android.intent.action.MAIN')
      )
    );

    if (mainActivity?.$) {
      delete mainActivity.$['android:screenOrientation'];
      mainActivity.$['android:resizeableActivity'] = 'true';
    }

    let scannerActivity = activities.find(
      (activity) =>
        activity.$?.['android:name'] ===
        'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity'
    );
    if (!scannerActivity && application) {
      scannerActivity = {
        $: {
          'android:name': 'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity',
        },
      };
      application.activity = [...activities, scannerActivity];
    }
    if (scannerActivity?.$) {
      delete scannerActivity.$['android:screenOrientation'];
      scannerActivity.$['tools:remove'] = 'android:screenOrientation';
    }

    return configWithManifest;
  });
};
