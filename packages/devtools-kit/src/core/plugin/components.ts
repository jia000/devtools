import { debounce } from 'perfect-debounce';

import type TMagicApp from '@tmagic/core';
import type { MApp } from '@tmagic/core';

import { hook } from '../../hook';
import type { PluginDescriptor, PluginSetupFunction } from '../../types';

const INSPECTOR_ID = 'components';

export function createComponentsDevToolsPlugin(app?: TMagicApp): [PluginDescriptor, PluginSetupFunction] {
  const descriptor: PluginDescriptor = {
    id: INSPECTOR_ID,
    label: 'Components',
    app,
  };

  const setupFn: PluginSetupFunction = (api) => {
    const debounceSendDsl = debounce((data: { inspectorId: string }) => {
      if (!app) return;

      api.sendDsl({
        ...data,
        config: app.dsl!,
        activePageId: app.page?.data.id,
      });
    }, 120);

    hook.on.tmagicDslChange((config: MApp) => {
      if (config.id === app?.dsl?.id) {
        debounceSendDsl({ inspectorId: 'pages' });
      }
    });

    hook.on.tmagicPageChange(() => {
      debounceSendDsl({ inspectorId: 'active-page' });
    });
  };

  return [descriptor, setupFn];
}
