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
    const debounceSendDsl = debounce((data: { config: MApp; inspectorId: string }) => {
      api.sendDsl(data);
    }, 120);

    hook.on.tmagicDslChange((config: MApp) => {
      debounceSendDsl({ config, inspectorId: 'pages' });
    });
  };

  return [descriptor, setupFn];
}
