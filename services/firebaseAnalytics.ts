type FirebaseAnalyticsModule = {
  logScreenView: (params: { screen_name: string; screen_class: string }) => Promise<void>;
  setAnalyticsCollectionEnabled?: (enabled: boolean) => Promise<void>;
};

let analyticsModule: FirebaseAnalyticsModule | null = null;
let analyticsModuleInitialized = false;

const getAnalyticsModule = (): FirebaseAnalyticsModule | null => {
  if (analyticsModuleInitialized) {
    return analyticsModule;
  }

  analyticsModuleInitialized = true;

  try {
    const firebaseAnalytics = require('@react-native-firebase/analytics');
    if (typeof firebaseAnalytics?.default === 'function') {
      analyticsModule = firebaseAnalytics.default();
    } else {
      analyticsModule = null;
    }
  } catch (error) {
    console.error('Firebase Analytics is unavailable. Screen tracking is disabled.', error);
    analyticsModule = null;
  }

  return analyticsModule;
};

export const enableFirebaseAnalytics = async (): Promise<void> => {
  const module = getAnalyticsModule();
  if (!module?.setAnalyticsCollectionEnabled) {
    return;
  }

  await module.setAnalyticsCollectionEnabled(true);
};

export const logFirebaseScreenView = async (screenName: string): Promise<void> => {
  const module = getAnalyticsModule();
  if (!module) {
    return;
  }

  await module.logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
};
