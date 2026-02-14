import type { WatchEntry } from '../services/api';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Recommend: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Detail: {
    entry: WatchEntry;
  };
};