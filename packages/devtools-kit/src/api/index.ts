import type { MApp } from '@tmagic/core';

import {
  type DevtoolsContext,
  DevToolsContextHookKeys,
  DevToolsPluginAPIHookKeys,
  type DevToolsPluginAPIHooks,
} from '../ctx';
import type { DevToolsPlugin } from '../types';

export class DevToolsPluginAPI {
  private plugin: DevToolsPlugin;
  private hooks: DevtoolsContext['hooks'];
  constructor({ plugin, ctx }: { plugin: DevToolsPlugin; ctx: DevtoolsContext }) {
    this.hooks = ctx.hooks;
    this.plugin = plugin;
  }

  public get on() {
    return {
      getDsl: (handler: DevToolsPluginAPIHooks[DevToolsPluginAPIHookKeys.GET_DSL]) => {
        this.hooks.hook(DevToolsPluginAPIHookKeys.GET_DSL, handler);
      },
    };
  }

  sendDsl({ config, inspectorId }: { config: MApp; inspectorId: string }) {
    this.hooks.callHook(DevToolsContextHookKeys.SEND_DSL, { config, inspectorId, plugin: this.plugin });
  }
}
