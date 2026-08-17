const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withPreviewCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;

    if (process.env.EAS_BUILD_PROFILE === 'preview') {
      application.$ = {
        ...(application.$ ?? {}),
        'android:usesCleartextTraffic': 'true',
      };
    } else if (application.$) {
      delete application.$['android:usesCleartextTraffic'];
    }

    return config;
  });
};
