import type { Hookable } from 'hookable';

import { getComponentInspector } from '../core/component-inspector';

import { DevToolsPluginAPIHookKeys, DevToolsPluginAPIHookPayloads } from './hook';
import { activeAppRecord, devtoolsAppRecords, setActiveAppRecord, setActiveAppRecordId } from './state';

export function createDevToolsApi(hooks: Hookable) {
  return {
    // get inspector tree
    async getDsl(payload: Pick<DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.GET_DSL], 'inspectorId'>) {
      const _payload = {
        ...payload,
        config: activeAppRecord.value.dsl,
      };

      await new Promise<void>((resolve) => {
        hooks.callHookWith(async (callbacks) => {
          await Promise.all(callbacks.map((cb) => cb(_payload)));
          resolve();
        }, DevToolsPluginAPIHookKeys.GET_DSL);
      });

      return _payload;
    },
    // scroll to component
    scrollToComponent(_id: string) {},
    // get tmagic inspector
    getTMagicInspector: getComponentInspector,
    // toggle app
    toggleApp(id: string) {
      const appRecord = devtoolsAppRecords.value.find((record) => record.id === id);

      if (appRecord) {
        setActiveAppRecordId(id);
        setActiveAppRecord(appRecord);
      }
    },
  };
}

export type DevToolsApiType = ReturnType<typeof createDevToolsApi>;
