import { createHooks } from 'hookable';

export interface DevToolsPluginAPIHookPayloads {
  [DevToolsPluginAPIHookKeys.GET_DSL]: {
    inspectorId: string;
  };
}

export interface DevToolsPluginAPIHooks {
  [DevToolsPluginAPIHookKeys.GET_DSL]: (
    payload: DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.GET_DSL],
  ) => void;
}

export enum DevToolsPluginAPIHookKeys {
  GET_DSL = 'getDsl',
}

export enum DevToolsContextHookKeys {
  SEND_DSL = 'sendDsl',
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
  hooks.hook(DevToolsContextHookKeys.SEND_DSL, async ({ config, inspectorId, plugin }) => {
    if (!config || !plugin?.descriptor?.app) return;

    const _payload = {
      config,
      inspectorId,
    };

    hooks.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb(_payload)));
    }, DevToolsMessagingHookKeys.SEND_DSL_TO_CLIENT);
  });

  return hooks;
}
