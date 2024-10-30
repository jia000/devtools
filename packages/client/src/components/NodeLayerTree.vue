<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';

import Tree from './node-tree/Tree.vue';

import { LayerNodeStatus, TreeNodeData } from '~/types/tree';
import { createPageNodeStatus, updateStatus, useFilter } from '~/utils/tree';

const props = defineProps<{
  data: TreeNodeData[];
  filterNodeName: string;
}>();

const activeNodeId = defineModel<string>('activeNodeId');
const activeNode = defineModel<any>('activeNode');

/** 当前页面的节点状态 */
const nodeStatusMap = ref(new Map<string | number, LayerNodeStatus>());

// 切换页面或者新增页面，重新生成节点状态
watch(
  () => props.data,
  (pages) => {
    if (!pages) {
      nodeStatusMap.value.clear();
      return;
    }

    // 生成节点状态
    nodeStatusMap.value = createPageNodeStatus(pages, nodeStatusMap.value);
  },
  {
    immediate: true,
  },
);

watch(
  activeNodeId,
  (id, preId) => {
    if (preId) {
      updateStatus(nodeStatusMap.value, preId, { selected: false });
    }

    if (id) {
      updateStatus(nodeStatusMap.value, id, { selected: true });
    }
  },
  {
    immediate: true,
  },
);

const nodeClickHandler = (event: MouseEvent, data: TreeNodeData) => {
  activeNodeId.value = `${data.id}`;
  activeNode.value = data;
};

const filterNodeMethod = (v: string, data: any): boolean => {
  let name = '';
  if (data.name) {
    name = data.name;
  } else if (data.items) {
    name = 'container';
  }

  return `${data.id}${name}${data.type}`.includes(v);
};

const { filterTextChangeHandler } = useFilter(
  computed(() => props.data),
  nodeStatusMap,
  filterNodeMethod,
);

watchDebounced(
  () => props.filterNodeName,
  (v) => {
    filterTextChangeHandler(v);
  },
  { debounce: 300 },
);
</script>

<template>
  <Tree
    v-if="data.length"
    tabindex="-1"
    ref="tree"
    :data="data"
    :node-status-map="nodeStatusMap"
    @node-click="nodeClickHandler"
  >
    <template #tree-node-content="{ data: nodeData }">
      <slot name="layer-node-content" :data="nodeData"> </slot>
    </template>

    <template #tree-node-tool="{ data: nodeData }">
      <slot name="layer-node-tool" :data="nodeData"></slot>
    </template>

    <template #tree-node-label="{ data: nodeData }">
      <slot name="layer-node-label" :data="nodeData"></slot>
    </template>
  </Tree>
</template>
