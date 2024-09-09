import type { Id, MApp } from '@tmagic/core';

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

  sendDsl({ config, activePageId, inspectorId }: { config: MApp; activePageId?: Id; inspectorId: string }) {
    this.hooks.callHook(DevToolsContextHookKeys.SEND_DSL, { config, activePageId, inspectorId, plugin: this.plugin });
  }
}
