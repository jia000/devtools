<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { isObject } from '@vue/devtools-shared';

import ChildStateViewer from './ChildStateViewer.vue';
import { createStateEditorContext } from './state-editor';
import StateFieldViewer from './StateFieldViewer.vue';
import { useToggleExpanded } from './toggle-expanded';

import ToggleExpanded from '~/components/common/ToggleExpanded.vue';

const props = withDefaults(
  defineProps<{
    data: {
      id: string;
      type: string;
      name: string;
      props: Record<string, any>;
      style: Record<string, any>;
      events: Record<string, any>[];
      hooks: Record<string, any>;
    };
    inspectorId: string;
    disableEdit?: boolean;
    expandedStateId?: string;
  }>(),
  {
    disableEdit: false,
    expandedStateId: '',
  },
);

function initEditorContext() {
  return {
    nodeId: props.data.props.id,
    inspectorId: props.inspectorId,
    disableEdit: props.disableEdit,
  };
}

const { context } = createStateEditorContext(initEditorContext());
watchEffect(() => {
  context.value = initEditorContext();
});

const { expanded, toggleExpanded } = useToggleExpanded();

toggleExpanded('0');
toggleExpanded('1');

const state = computed(() => {
  const { id, name, type, ...rest } = props.data;
  return rest;
});

const hasChildren = (stateValue: any) => {
  if (Array.isArray(stateValue)) {
    return stateValue.length > 0;
  }

  if (isObject(stateValue)) {
    return Object.keys(stateValue).length > 0;
  }
  return false;
};
</script>

<template>
  <div>
    <StateFieldViewer state-key="id" :state-value="data.id" :depth="0" index="0" />
    <StateFieldViewer state-key="type" :state-value="data.type" :depth="0" index="1" />
    <div v-for="([key, item], index) in Object.entries(state)" :key="index">
      <div
        class="flex items-center"
        :class="[item?.length && 'cursor-pointer hover:(bg-active)']"
        @click="toggleExpanded(`${index}`)"
      >
        <ToggleExpanded v-if="hasChildren(item)" :value="expanded.includes(`${index}`)" />
        <!-- placeholder -->
        <span v-else pl5 />
        <span font-state-field text-3.5>
          {{ key }}
        </span>
      </div>
      <div v-if="hasChildren(item) && expanded.includes(`${index}`)">
        <ChildStateViewer :data="item" :index="`${index}`" :expanded-state-id="expandedStateId" />
      </div>
    </div>
  </div>
</template>
