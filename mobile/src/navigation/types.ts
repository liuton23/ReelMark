import type { WatchEntry } from '../services/api';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Recommend: undefined;
};

export type RootStackParamList = {
  login: undefined;
  Main: undefined;
  Detail: {
    entry: WatchEntry;
  };
};