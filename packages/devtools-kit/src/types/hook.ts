import type TMagicApp from '@tmagic/core';
import type { Id, MApp } from '@tmagic/core';

import type { AppRecord } from './app';
import type { PluginDescriptor, PluginSetupFunction } from './plugin';

export enum DevToolsHooks {
  APP_INIT = 'app:init',
  APP_DESTROY = 'app:destroy',
  DSL_CHANGE = 'dsl:change',
  PAGE_CHANGE = 'page:change',
  SETUP_DEVTOOLS_PLUGIN = 'devtools-plugin:setup',
}

export interface DevToolsEvent {
  [DevToolsHooks.APP_INIT]: (app: TMagicApp, version: string) => void | Promise<void>;
  [DevToolsHooks.APP_DESTROY]: (app: TMagicApp) => void | Promise<void>;
  [DevToolsHooks.DSL_CHANGE]: (config: MApp) => void | Promise<void>;
  [DevToolsHooks.PAGE_CHANGE]: (id: Id) => void | Promise<void>;
  [DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]: (
    pluginDescriptor: PluginDescriptor,
    setupFn: PluginSetupFunction,
    options?: { target?: string },
  ) => void;
}

export interface DevToolsHook {
  id: string;
  enabled?: boolean;
  devtoolsVersion: string;
  events: Map<DevToolsHooks, Function[]>;
  emit: (event: DevToolsHooks, ...payload: any[]) => void;
  on: <T extends Function>(event: DevToolsHooks, handler: T) => () => void;
  once: <T extends Function>(event: DevToolsHooks, handler: T) => void;
  off: <T extends Function>(event: DevToolsHooks, handler: T) => void;
  appRecords: AppRecord[];
  apps: any;
  cleanupBuffer?: (matchArg: unknown) => boolean;
}

export interface TMagicHooks {
  on: {
    tmagicAppInit: (fn: DevToolsEvent[DevToolsHooks.APP_INIT]) => void;
    tmagicAppDestroy: (fn: DevToolsEvent[DevToolsHooks.APP_DESTROY]) => void;
    tmagicDslChange: (fn: DevToolsEvent[DevToolsHooks.DSL_CHANGE]) => void;
    tmagicPageChange: (fn: DevToolsEvent[DevToolsHooks.PAGE_CHANGE]) => void;
    setupDevtoolsPlugin: (fn: DevToolsEvent[DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]) => void;
  };
  setupDevToolsPlugin: (pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction) => void;
}
