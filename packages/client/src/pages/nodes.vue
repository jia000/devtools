<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue';
import { VueInput } from '@vue/devtools-ui';
import { useElementSize } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';

import { DevToolsMessagingEvents, rpc, useDevToolsState } from '@tmagic/devtools-core';

import NodeLayerTree from '../components/NodeLayerTree.vue';
import SelectiveList from '../components/SelectiveList.vue';
import RootStateViewer from '../components/state/RootStateViewer.vue';

const splitpanesRef = ref<HTMLDivElement>();
const splitpanesReady = ref(false);

const { width: splitpanesWidth } = useElementSize(splitpanesRef);

const horizontal = computed(() => (splitpanesReady.value ? splitpanesWidth.value < 700 : false));

// #region toggle app
const devtoolsState = useDevToolsState();

const appRecords = computed(() =>
  devtoolsState.appRecords.value.map((app) => ({
    label: app.name + (app.version ? ` (${app.version})` : ''),
    value: app.id,
  })),
);

const normalizedAppRecords = computed(() =>
  appRecords.value.map((app) => ({
    label: app.label,
    id: app.value,
  })),
);

const activeAppRecordId = ref(devtoolsState.activeAppRecordId.value);
watchEffect(() => {
  activeAppRecordId.value = devtoolsState.activeAppRecordId.value;
});

const nodeTreeLoaded = ref(false);
const filterNodeName = ref('');
const pages = ref<any[]>([]);
const activeNodeId = ref('');
const activeNode = ref<any>();

getComponentsInspectorTree();

function updateActiveNode(pageId: string) {
  if (!pageId) {
    activeNode.value = {};
  } else {
    activeNode.value = pages.value.find((item) => item.id === pageId).config;
  }
}

const inspectorId = 'page';
async function getComponentsInspectorTree() {
  return rpc.value.getDsl({ inspectorId }).then((data) => {
    pages.value = data.config.items;
    activeNodeId.value = data.activePageId;
    updateActiveNode(data.activePageId);
    nodeTreeLoaded.value = true;
  });
}

function toggleApp(id: string) {
  rpc.value.toggleApp(id).then(() => {
    activeNodeId.value = '';
    activeNode.value = {};
    getComponentsInspectorTree();
  });
}

const updateActivePageId = ({ activePageId: pageId }) => {
  activeNodeId.value = pageId;
  updateActiveNode(pageId);
};

rpc.functions.on(DevToolsMessagingEvents.PAGE_UPDATED, updateActivePageId);

onBeforeUnmount(() => {
  rpc.functions.off(DevToolsMessagingEvents.PAGE_UPDATED, updateActivePageId);
});

const activeNodeState = computed(() => {
  const { id, type, name, style = {}, events = [], created, mounted, items, display, ...rest } = activeNode.value || {};
  return {
    id,
    type,
    name,
    props: rest,
    style,
    events,
    hooks: { created, mounted, display },
  };
});
</script>

<template>
  <div class="h-full w-full">
    <Splitpanes
      ref="splitpanesRef"
      class="flex-1 overflow-auto"
      :horizontal="horizontal"
      @ready="splitpanesReady = true"
    >
      <Pane v-if="appRecords.length > 1" border="base h-full" size="20">
        <div class="no-scrollbar h-full flex select-none gap-2 overflow-scroll">
          <SelectiveList v-model="activeAppRecordId" :data="normalizedAppRecords" class="w-full" @select="toggleApp" />
        </div>
      </Pane>
      <Pane border="base" h-full>
        <div v-if="nodeTreeLoaded" class="h-full flex flex-col p2">
          <div class="flex py2">
            <VueInput
              v-model="filterNodeName"
              :loading-debounce-time="250"
              placeholder="Find nodes..."
              class="flex-1 text-3.5"
            />
          </div>
          <div ref="componentTreeContainer" class="no-scrollbar flex-1 select-none overflow-scroll">
            <NodeLayerTree
              :data="pages"
              v-model:activeNodeId="activeNodeId"
              v-model:activeNode="activeNode"
              :filter-node-name="filterNodeName"
            ></NodeLayerTree>
          </div>
        </div>
      </Pane>
      <Pane relative h-full>
        <div class="h-full flex flex-col p2">
          <div class="flex py2" border="b">
            <!-- component name -->
            <span v-if="activeNode?.name" class="font-state-field flex items-center px-1 text-3.5">
              <span
                group-hover:text-white
                class="max-w-40 of-hidden text-ellipsis ws-nowrap [.active_&]:(text-white)"
                >{{ activeNode.name }}</span
              >
            </span>
          </div>
          <RootStateViewer
            class="no-scrollbar flex-1 select-none overflow-scroll"
            inspector-id="nodes"
            :data="activeNodeState"
          ></RootStateViewer>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
