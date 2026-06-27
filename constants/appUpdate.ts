export const ANDROID_PACKAGE = 'com.brody32.better';
export const IOS_BUNDLE_ID = 'com.brody32.better';

export const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const ANDROID_MARKET_URL = `market://details?id=${ANDROID_PACKAGE}`;

export const VERSION_MANIFEST_URL =
  'https://raw.githubusercontent.com/Enda21/BetterApp/main/app-version.json';

export type VersionManifest = {
  latestVersion?: string;
  ios?: {
    latestVersion?: string;
    storeUrl?: string;
  };
  android?: {
    latestVersion?: string;
    storeUrl?: string;
  };
  iosStoreUrl?: string;
  androidStoreUrl?: string;
};
