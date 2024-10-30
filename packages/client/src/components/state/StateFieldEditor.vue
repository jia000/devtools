<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import type { ButtonProps } from '@vue/devtools-ui';
import { vTooltip, VueButton, VueDropdown, VueDropdownButton, VueIcon } from '@vue/devtools-ui';
import { useClipboard } from '@vueuse/core';

import { rpc } from '@tmagic/devtools-core';
import type { DevToolsPluginAPIHookPayloads } from '@tmagic/devtools-kit';
import { DevToolsPluginAPIHookKeys } from '@tmagic/devtools-kit';

import type { EditorInputValidType } from './state-editor';
import { useStateEditorContext } from './state-editor';

const props = withDefaults(
  defineProps<{
    stateKey: string;
    stateValue: any;
    hovering: boolean;
    depth: number;
    showAddIfNeeded?: boolean;
    disableEdit?: boolean;
  }>(),
  {
    showAddIfNeeded: true,
  },
);

defineEmits<{
  enableEditInput: [type: EditorInputValidType];
}>();

const state = useStateEditorContext();

const { copy, isSupported } = useClipboard();

const popupVisible = ref(false);

const raw = computed(() => toRaw(props.stateValue));
const rawValue = computed(() => raw.value);
const dataType = computed(() => (rawValue.value === null ? 'null' : typeof rawValue.value));

const iconButtonProps = {
  flat: true,
  size: 'mini',
} satisfies ButtonProps;

const buttonClass = computed(() => ({
  'opacity-0': !props.hovering,
}));

async function quickEdit(v: unknown) {
  await rpc.value.editInspectorState({
    state: {
      id: state.value.nodeId,
      [props.stateKey]: toRaw(v),
      value: toRaw(v),
    },
  } as unknown as DevToolsPluginAPIHookPayloads[DevToolsPluginAPIHookKeys.EDIT_NODE_CONFIG]);
  await rpc.value.sendInspectorState(state.value.inspectorId);
}

function quickEditNum(v: number | string, offset: 1 | -1) {
  const target = typeof v === 'number' ? v + offset : BigInt(v) + BigInt(offset);
  quickEdit(target);
}
</script>

<template>
  <div class="flex pl5px">
    <!-- only editable will show operate actions -->
    <template v-if="!props.disableEdit">
      <!-- input edit, number/string/object -->
      <template v-if="dataType === 'string' || dataType === 'number' || dataType === 'object' || dataType === 'null'">
        <VueButton
          v-tooltip="{
            content: 'Edit value',
          }"
          v-bind="iconButtonProps"
          :class="buttonClass"
          @click.stop="$emit('enableEditInput', dataType)"
        >
          <template #icon>
            <VueIcon icon="i-material-symbols-edit-rounded" />
          </template>
        </VueButton>
      </template>
      <!-- checkbox, button value only -->
      <VueButton
        v-if="dataType === 'boolean'"
        v-bind="iconButtonProps"
        :class="buttonClass"
        @click="quickEdit(!rawValue)"
      >
        <template #icon>
          <VueIcon
            :icon="rawValue ? 'i-material-symbols-check-box-sharp' : 'i-material-symbols-check-box-outline-blank-sharp'"
          />
        </template>
      </VueButton>
      <!-- increment/decrement button, numeric/bigint -->
      <template v-else-if="dataType === 'number'">
        <VueButton
          v-bind="iconButtonProps"
          :class="buttonClass"
          @click.stop="quickEditNum(rawValue as number | string, 1)"
        >
          <template #icon>
            <VueIcon icon="i-carbon-add" />
          </template>
        </VueButton>
        <VueButton
          v-bind="iconButtonProps"
          :class="buttonClass"
          @click.stop="quickEditNum(rawValue as number | string, -1)"
        >
          <template #icon>
            <VueIcon icon="i-carbon-subtract" />
          </template>
        </VueButton>
      </template>
    </template>
    <!-- Copy key/value -->
    <VueDropdown
      :class="{
        'opacity-0': !hovering && !popupVisible,
      }"
      :button-props="{
        flat: true,
        size: 'mini',
      }"
      :disabled="!isSupported"
      @update:visible="(v) => (popupVisible = v)"
    >
      <template #popper>
        <div class="w160px py5px">
          <VueDropdownButton
            @click="copy(typeof rawValue === 'object' ? JSON.stringify(rawValue) : rawValue.toString())"
          >
            <template #icon>
              <VueIcon icon="i-material-symbols-copy-all-rounded" class="mt4px" />
              Copy Value
            </template>
          </VueDropdownButton>
        </div>
      </template>
      <template #button-icon>
        <VueIcon icon="i-material-symbols:more-vert" />
      </template>
    </VueDropdown>
  </div>
</template>
