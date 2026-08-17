const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PERMISSION = 'android.permission.SYSTEM_ALERT_WINDOW';

function removePermission(manifestPath) {
  if (!fs.existsSync(manifestPath)) return;

  const source = fs.readFileSync(manifestPath, 'utf8');
  const permissionPattern = new RegExp(
    `\\s*<uses-permission\\s+android:name=["']${PERMISSION}["'][^>]*/>`,
    'g',
  );
  const next = source.replace(permissionPattern, '');

  if (next !== source) fs.writeFileSync(manifestPath, next);
}

module.exports = function withRemoveSystemAlertWindow(config) {
  config = withAndroidManifest(config, (config) => {
    config.modResults.manifest['uses-permission'] = (
      config.modResults.manifest['uses-permission'] ?? []
    ).filter((permission) => permission.$?.['android:name'] !== PERMISSION);
    return config;
  });

  return withDangerousMod(config, [
    'android',
    async (config) => {
      const androidRoot = config.modRequest.platformProjectRoot;
      for (const sourceSet of ['main', 'debug', 'debugOptimized']) {
        removePermission(
          path.join(androidRoot, 'app', 'src', sourceSet, 'AndroidManifest.xml'),
        );
      }
      return config;
    },
  ]);
};
