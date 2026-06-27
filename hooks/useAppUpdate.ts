import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  ANDROID_MARKET_URL,
  ANDROID_STORE_URL,
  IOS_BUNDLE_ID,
  VERSION_MANIFEST_URL,
  VersionManifest,
} from '../constants/appUpdate';
import { isVersionNewer } from '../utils/compareVersions';

type AppUpdateState = {
  updateAvailable: boolean;
  latestVersion: string | null;
  loading: boolean;
  openStore: () => Promise<void>;
};

type ItunesLookupResult = {
  resultCount: number;
  results: Array<{
    version: string;
    trackViewUrl: string;
  }>;
};

async function fetchVersionManifest(): Promise<{
  latestVersion: string | null;
  storeUrl: string | null;
}> {
  const response = await fetch(VERSION_MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) {
    return { latestVersion: null, storeUrl: null };
  }

  const data = (await response.json()) as VersionManifest;
  const platformKey = Platform.OS === 'ios' ? 'ios' : 'android';
  const platformData = data[platformKey];

  return {
    latestVersion: platformData?.latestVersion ?? data.latestVersion ?? null,
    storeUrl:
      platformData?.storeUrl ??
      (platformKey === 'ios' ? data.iosStoreUrl : data.androidStoreUrl) ??
      null,
  };
}

async function fetchIosStoreVersion(): Promise<{
  latestVersion: string | null;
  storeUrl: string | null;
}> {
  const response = await fetch(
    `https://itunes.apple.com/lookup?bundleId=${IOS_BUNDLE_ID}`,
  );
  if (!response.ok) {
    return { latestVersion: null, storeUrl: null };
  }

  const data = (await response.json()) as ItunesLookupResult;
  if (data.resultCount === 0) {
    return { latestVersion: null, storeUrl: null };
  }

  const app = data.results[0];
  return {
    latestVersion: app.version ?? null,
    storeUrl: app.trackViewUrl ?? null,
  };
}

export function useAppUpdate(): AppUpdateState {
  const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let latest: string | null = null;
      let url: string | null = null;

      try {
        const manifest = await fetchVersionManifest();
        latest = manifest.latestVersion;
        url = manifest.storeUrl;
      } catch {
        // Fall back to store lookup below when the manifest is unavailable.
      }

      if (Platform.OS === 'ios' && !latest) {
        try {
          const iosStore = await fetchIosStoreVersion();
          latest = iosStore.latestVersion;
          url = iosStore.storeUrl;
        } catch {
          // Ignore lookup failures and keep the home screen usable.
        }
      }

      if (!cancelled) {
        setLatestVersion(latest);
        setStoreUrl(url);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateAvailable = latestVersion
    ? isVersionNewer(latestVersion, currentVersion)
    : false;

  const openStore = useCallback(async () => {
    if (Platform.OS === 'android') {
      const androidUrl = storeUrl ?? ANDROID_STORE_URL;
      try {
        await Linking.openURL(ANDROID_MARKET_URL);
        return;
      } catch {
        await Linking.openURL(androidUrl);
        return;
      }
    }

    const iosUrl = storeUrl ?? 'https://apps.apple.com/search?term=Better+App';
    await Linking.openURL(iosUrl);
  }, [storeUrl]);

  return {
    updateAvailable,
    latestVersion,
    loading,
    openStore,
  };
}
