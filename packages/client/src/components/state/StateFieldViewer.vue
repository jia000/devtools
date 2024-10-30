<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { isObject } from '@vue/devtools-shared';

import { rpc } from '@tmagic/devtools-core';
import {
  DevToolsPluginAPIHookKeys,
  DevToolsPluginAPIHookPayloads,
  formatInspectorStateValue,
  toEdit,
  toSubmit,
} from '@tmagic/devtools-kit';

import ChildStateViewer from './ChildStateViewer.vue';
import { useHover } from './hover';
import { useStateEditor, useStateEditorContext } from './state-editor';
import StateFieldEditor from './StateFieldEditor.vue';
import StateFieldInputEditor from './StateFieldInputEditor.vue';
import { useToggleExpanded } from './toggle-expanded';

import ToggleExpanded from '~/components/common/ToggleExpanded.vue';

const props = defineProps<{
  stateKey: string;
  stateValue: any;
  depth: number;
  index: string;
  expandedStateId?: string;
}>();

// display value
const displayedValue = computed(() =>
  formatInspectorStateValue(props.stateValue, false, {
    customClass: {
      string: 'max-w-120 truncate',
    },
  }),
);

const normalizedDisplayedValue = computed(() => {
  const type = typeof props.stateValue;

  const normalizedTypeMap = {
    string: 'string',
    number: 'literal',
    boolean: 'boolean',
  };

  const normalizedType = normalizedTypeMap[type];

  const selectText = type === 'string' ? 'select-text' : '';

  if (!normalizedType) {
    return `<span class="flex whitespace-nowrap">${displayedValue.value}</span>`;
  }
  return `<span class="${normalizedType}-state-type flex whitespace-nowrap ${selectText}">${displayedValue.value}</span>`;
});

const { expanded, toggleExpanded } = useToggleExpanded(props.expandedStateId ?? '');

// has children
const hasChildren = computed(() => {
  if (Array.isArray(props.stateValue)) {
    return props.stateValue.length > 0;
  }

  if (isObject(props.stateValue)) {
    return Object.keys(props.stateValue).length > 0;
  }
  return false;
});

// #region editor
const containerRef = ref<HTMLDivElement>();
const state = useStateEditorContext();
const { isHovering } = useHover(() => containerRef.value);

const { editing, editingText, toggleEditing, nodeId } = useStateEditor();

watch(
  () => editing.value,
  (v) => {
    if (v) {
      editingText.value = toEdit(v);
    } else {
      editingText.value = '';
    }
  },
);

async function submit() {
  const { stateKey } = props;
  await rpc.value.editInspectorState({
    inspectorId: state.value.inspectorId,
    config: {
      id: nodeId.value,
      [stateKey]: toSubmit(editingText.value),
    },
  } as unknown as DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.EDIT_NODE_CONFIG]);
  await rpc.value.sendInspectorState(state.value.inspectorId);
  toggleEditing();
}
</script>

<template>
  <div>
    <div
      ref="containerRef"
      class="font-state-field flex items-center text-3.5"
      :class="[hasChildren && 'cursor-pointer hover:(bg-active)']"
      :style="{ paddingLeft: `${depth * 15 + 4}px` }"
      @click="toggleExpanded(`${depth}-${index}`)"
    >
      <ToggleExpanded v-if="hasChildren" :value="expanded.includes(`${depth}-${index}`)" />
      <!-- placeholder -->
      <span v-else pl5 />
      <span op70 class="whitespace-nowrap">
        {{ stateKey }}
      </span>
      <span mx1>:</span>
      <StateFieldInputEditor
        v-if="editing"
        v-model="editingText"
        class="mr-1"
        @cancel="toggleEditing"
        @submit="submit"
      />
      <span class="flex whitespace-nowrap">
        <span class="flex" v-html="normalizedDisplayedValue" />
      </span>
      <StateFieldEditor
        :hovering="isHovering"
        :disable-edit="state.disableEdit || editing"
        :state-key="stateKey"
        :state-value="stateValue"
        :depth="depth"
        @enable-edit-input="toggleEditing"
      />
    </div>
    <div v-if="hasChildren && expanded.includes(`${depth}-${index}`)">
      <ChildStateViewer :data="stateValue" :depth="depth" :index="index" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// string
:deep(.string-custom-state) {
  --at-apply: string-state-type;
}

// function
:deep(.function-custom-state) {
  --at-apply: font-italic;
  & > span {
    --at-apply: 'text-#0033cc dark:text-#997fff';
    font-family: Menlo, monospace;
  }
}

// component-definition
:deep(.component-definition-custom-state) {
  --at-apply: text-primary-500;
  & > span {
    --at-apply: 'text-#aaa';
  }
}

// component
:deep(.component-custom-state) {
  --at-apply: text-primary-500;
  &::before {
    content: '<';
  }
  &::after {
    content: '>';
  }
  &::before,
  &::after {
    --at-apply: 'text-#aaa';
  }
}
</style>
