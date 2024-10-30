import type { InjectionKey, Ref } from 'vue';
import { computed, inject, provide, ref } from 'vue';

interface StateEditorContext {
  nodeId: string;
  inspectorId: string;
  disableEdit: boolean;
}
const StateEditorSymbolKey: InjectionKey<Ref<StateEditorContext>> = Symbol('StateEditorSymbol');

export function createStateEditorContext(initial: StateEditorContext) {
  const context = ref<StateEditorContext>(initial);
  provide(StateEditorSymbolKey, context);
  return {
    context,
  };
}

export function useStateEditorContext() {
  const context = inject(StateEditorSymbolKey)!;
  return context;
}

export type EditorInputValidType = 'number' | 'string' | 'object' | 'null';

export function useStateEditor() {
  const editingText = ref('');
  const editingType = ref<EditorInputValidType>('string');
  const editing = ref(false);

  const state = useStateEditorContext();

  return {
    editingText,
    editing,
    toggleEditing(t?: EditorInputValidType) {
      if (t) editingType.value = t;
      editing.value = !editing.value;
    },
    editingType,
    nodeId: computed(() => state.value.nodeId),
  };
}

