<script setup lang="ts">
import StateFieldViewer from './StateFieldViewer.vue';

withDefaults(
  defineProps<{
    data: Record<string, any>;
    depth?: number;
    index: string;
    expandedStateId?: string;
  }>(),
  {
    depth: 0,
    expandedStateId: '',
  },
);
</script>

<template>
  <div>
    <div v-for="([key, item], i) in Object.entries(data)" :key="i">
      <StateFieldViewer
        :state-key="`${key}`"
        :state-value="item"
        :depth="depth + 1"
        :index="`${index}-${i}`"
        :expanded-state-id="expandedStateId"
      />
    </div>
  </div>
</template>
