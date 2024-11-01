import { initDevTools, onDevToolsClientConnected } from './core';
import { devtoolsContext } from './ctx';
import { hook } from './hook';

export * from './core';
export { formatInspectorStateValue, toEdit, toSubmit } from './core/component/state/format';
export * from './ctx';
export * from './messaging';
export type * from './types';

export const devtools = {
  hook,
  init: () => {
    initDevTools();
  },
  get ctx() {
    return devtoolsContext;
  },
  get api() {
    return devtoolsContext.api;
  },
};

export { onDevToolsClientConnected };
