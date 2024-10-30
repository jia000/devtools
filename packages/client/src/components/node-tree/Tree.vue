<script setup lang="ts">
import { provide } from 'vue';

import TreeNode from './TreeNode.vue';

import type { LayerNodeStatus, TreeNodeData } from '~/types/tree';

defineSlots<{
  'tree-node-content'(props: { data: TreeNodeData }): any;
  'tree-node-label'(props: { data: TreeNodeData }): any;
  'tree-node-tool'(props: { data: TreeNodeData }): any;
}>();

defineOptions({
  name: 'MEditorTree',
});

const emit = defineEmits<{
  'node-click': [event: MouseEvent, data: TreeNodeData];
}>();

provide('treeEmit', emit);

withDefaults(
  defineProps<{
    data: TreeNodeData[];
    nodeStatusMap: Map<string | number, LayerNodeStatus>;
    indent?: number;
    nextLevelIndentIncrement?: number;
    emptyText?: string;
  }>(),
  {
    indent: 0,
    emptyText: '暂无数据',
  },
);
</script>

<template>
  <div class="m-editor-tree">
    <template v-if="data?.length">
      <TreeNode
        v-for="item in data"
        :key="item.id"
        :data="item"
        :indent="indent"
        :next-level-indent-increment="nextLevelIndentIncrement"
        :node-status-map="nodeStatusMap"
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
    </template>
    <div v-else class="m-editor-tree-empty">
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<style lang="scss">
.m-editor-tree {
  $--node-height: 22px;
  $--theme-color: #2882e0;
  $--font-color: #313a40;
  $--hover-color: #f3f5f9;

  color: $--font-color;
  font-size: 13px;

  .m-editor-tree-node {
    cursor: pointer;
    white-space: nowrap;

    .tree-node {
      display: flex;
      align-items: center;

      &:hover {
        background-color: $--hover-color;
        color: $--font-color;
      }

      &.selected {
        background-color: $--theme-color;
        color: $--hover-color;
      }

      &.drag-inner {
        .tree-node-content {
          background-color: rgba($color: $--theme-color, $alpha: 0.5);
          color: $--hover-color;
        }
      }

      &.drag-before {
        .tree-node-content {
          border-top-color: rgba($color: $--theme-color, $alpha: 0.5);
        }
      }

      &.drag-after {
        .tree-node-content {
          border-bottom-color: rgba($color: $--theme-color, $alpha: 0.5);
        }
      }

      .expand-icon {
        padding: 4px;
        box-sizing: content-box;
        font-size: 14px;
      }

      .tree-node-content {
        display: flex;
        flex: 1;
        justify-content: space-between;
        height: $--node-height;
        border-top: 2px solid transparent;
        border-bottom: 2px solid transparent;
        .tree-node-label {
          line-height: $--node-height;
          flex: 1;
          width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;

          .disabled {
            cursor: default;
          }

          .hook {
            color: #999;
          }
        }
      }

      .tree-node-tool {
        display: flex;
        align-items: center;

        .tmagic-design-icon {
          margin-right: 10px;
        }
      }
    }
  }

  .m-editor-tree-empty {
    text-align: center;
    color: #909399;
    font-size: 14px;
  }
}
</style>
