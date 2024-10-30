import { createHooks } from 'hookable';

import type { MNode } from '@tmagic/core';

export interface DevToolsPluginAPIHookPayloads {
  [DevToolsPluginAPIHookKeys.GET_DSL]: {
    inspectorId: string;
  };
  [DevToolsPluginAPIHookKeys.EDIT_NODE_CONFIG]: {
    inspectorId: string;
    nodeId: string;
    config: MNode;
  };
}

export interface DevToolsPluginAPIHooks {
  [DevToolsPluginAPIHookKeys.GET_DSL]: (
    payload: DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.GET_DSL],
  ) => void;
  [DevToolsPluginAPIHookKeys.EDIT_NODE_CONFIG]: (
    payload: DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.EDIT_NODE_CONFIG],
  ) => void;
}

export enum DevToolsPluginAPIHookKeys {
  GET_DSL = 'getDsl',
  EDIT_NODE_CONFIG = 'editNodeConfig',
}

export enum DevToolsContextHookKeys {
  SEND_DSL = 'sendDsl',
  SEND_NODE_CONFIG = 'sendNodeConfig',
}

// devtools client hooks
export enum DevToolsMessagingHookKeys {
  SEND_DSL_TO_CLIENT = 'sendDslToClient',
  DEVTOOLS_STATE_UPDATED = 'devtoolsStateUpdated',
  DEVTOOLS_CONNECTED_UPDATED = 'devtoolsConnectedUpdated',
  SEND_ACTIVE_APP_DESTROY_TO_CLIENT = 'sendActiveAppUpdatedToClient',
}

export function createDevToolsCtxHooks() {
  const hooks = createHooks();

  // send inspector tree
  hooks.hook(DevToolsContextHookKeys.SEND_DSL, async ({ config, activePageId, inspectorId, plugin }) => {
    if (!config || !plugin?.descriptor?.app) return;

    const _payload = {
      config,
      inspectorId,
      activePageId,
    };

    hooks.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb(_payload)));
    }, DevToolsMessagingHookKeys.SEND_DSL_TO_CLIENT);
  });

  return hooks;
}
