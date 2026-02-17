import type { WatchEntry } from '../services/api';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Recommend: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Detail: {
    entry: WatchEntry;
  };
};