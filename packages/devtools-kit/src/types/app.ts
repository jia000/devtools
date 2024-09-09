import type TMagicApp from '@tmagic/core';

export interface AppRecord {
  id: string;
  name: string;
  app?: TMagicApp;
  version?: string;
}
