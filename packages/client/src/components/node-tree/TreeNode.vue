<script setup lang="ts">
import { computed, inject } from 'vue';

import type { LayerNodeStatus, TreeNodeData } from '~/types/tree';
import { updateStatus } from '~/utils/tree';

defineSlots<{
  'tree-node-label'(props: { data: TreeNodeData }): any;
  'tree-node-tool'(props: { data: TreeNodeData }): any;
  'tree-node-content'(props: { data: TreeNodeData }): any;
}>();

defineOptions({
  name: 'MEditorTreeNode',
});

const emit = defineEmits<{
  'node-click': [event: MouseEvent, data: TreeNodeData];
}>();

const treeEmit = inject<typeof emit>('treeEmit');

const props = withDefaults(
  defineProps<{
    data: TreeNodeData;
    parent?: TreeNodeData;
    parentsId?: (string | number)[];
    nodeStatusMap: Map<string | number, LayerNodeStatus>;
    indent?: number;
    nextLevelIndentIncrement?: number;
  }>(),
  {
    indent: 0,
    nextLevelIndentIncrement: 11,
    parentsId: () => [],
  },
);

const nodeStatus = computed(
  () =>
    props.nodeStatusMap?.get(props.data.id) || {
      selected: false,
      expand: false,
      visible: false,
      draggable: false,
    },
);

const expanded = computed(() => nodeStatus.value.expand);
const selected = computed(() => nodeStatus.value.selected);
const visible = computed(() => nodeStatus.value.visible);

const hasChildren = computed(
  () => Array.isArray(props.data.items) && props.data.items.some((item) => props.nodeStatusMap.get(item.id)?.visible),
);

const expandHandler = () => {
  updateStatus(props.nodeStatusMap, props.data.id, {
    expand: !expanded.value,
  });
};

const nodeClickHandler = (event: MouseEvent) => {
  treeEmit?.('node-click', event, props.data);
};
</script>

<template>
  <div
    v-show="visible"
    class="m-editor-tree-node"
    :data-node-id="data.id"
    :data-parent-id="parent?.id"
    :data-parents-id="parentsId"
    :data-is-container="Array.isArray(data.items)"
  >
    <div class="tree-node" :class="{ selected, expanded }" :style="`padding-left: ${indent}px`">
      <i
        class="i-radix-icons:triangle-right flex-none text-4 op-50 transition-base"
        :class="{
          'transform rotate-90': expanded,
        }"
        :style="hasChildren ? '' : 'color: transparent; cursor: default'"
        @click="expandHandler"
      />

      <div class="tree-node-content" @click="nodeClickHandler">
        <slot name="tree-node-content" :data="data">
          <div class="tree-node-label">
            <slot name="tree-node-label" :data="data">{{ `${data.name} (${data.id})` }}</slot>
          </div>
          <div class="tree-node-tool">
            <slot name="tree-node-tool" :data="data"></slot>
          </div>
        </slot>
      </div>
    </div>

    <div v-if="hasChildren && expanded" class="m-editor-tree-node-children">
      <TreeNode
        v-for="item in data.items"
        :key="item.id"
        :data="item"
        :parent="data"
        :parentsId="[...parentsId, data.id]"
        :node-status-map="nodeStatusMap"
        :indent="indent + nextLevelIndentIncrement"
      >
        <template #tree-node-content="{ data: nodeData }">
          <slot name="tree-node-content" :data="nodeData"> </slot>
        </template>
        <template #tree-node-label="{ data: nodeData }">
          <slot name="tree-node-label" :data="nodeData"> </slot>
        </template>
        <template #tree-node-tool="{ data: nodeData }">
          <slot name="tree-node-tool" :data="nodeData"> </slot>
        </template>
      </TreeNode>
    </div>
  </div>
</template>
