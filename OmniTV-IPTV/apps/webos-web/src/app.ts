import { XtreamClient, ParentalManager, type XtreamCredentials } from '@omnitv/core';
import { Toast } from '@omnitv/ui/src/components/Toast.js';
import { createLoginScreen } from './screens/Login.js';
import { createHomeScreen } from './screens/Home.js';
import { createLiveScreen } from './screens/Live.js';
import { createVODScreen } from './screens/VOD.js';
import { createSeriesScreen } from './screens/Series.js';
import { createPlayerScreen } from './screens/Player.js';
import { createSettingsScreen } from './screens/Settings.js';
import { WebOSSecureStorage } from './platform/storage.js';

export type ScreenName = 'login' | 'home' | 'live' | 'vod' | 'series' | 'player' | 'settings';

interface AppState {
  credentials: XtreamCredentials | null;
}

export function createApp(root: HTMLElement) {
  const state: AppState = { credentials: null };
  const storage = new WebOSSecureStorage();
  const parental = new ParentalManager({ storage });

  const screens = {
    login: createLoginScreen,
    home: createHomeScreen,
    live: createLiveScreen,
    vod: createVODScreen,
    series: createSeriesScreen,
    player: createPlayerScreen,
    settings: createSettingsScreen,
  } as const;

  const context = {
    root,
    navigate,
    getCredentials: () => state.credentials,
    setCredentials: (creds: XtreamCredentials | null) => {
      state.credentials = creds;
    },
    getClient: () => (state.credentials ? new XtreamClient(state.credentials) : null),
    parental,
    showToast: (message: string) => new Toast(message),
  };

  function navigate(screen: ScreenName, params?: Record<string, unknown>) {
    root.innerHTML = '';
    const creator = screens[screen];
    creator(context, params ?? {});
  }

  navigate('login');
}
