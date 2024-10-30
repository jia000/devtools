import { type Ref, ref } from 'vue';

import { LayerNodeStatus, TreeNodeData } from '~/types/tree';

export const updateStatus = (
  nodeStatusMap: Map<string | number, LayerNodeStatus>,
  id: string | number,
  status: Partial<LayerNodeStatus>,
) => {
  const nodeStatus = nodeStatusMap.get(id);

  if (!nodeStatus) return;
  Object.keys(status).forEach((key) => {
    if (nodeStatus[key] !== undefined && status[key] !== undefined) {
      nodeStatus[key] = Boolean(status[key]);
    }
  });
};

export interface NodeItem {
  items?: NodeItem[];
  [key: string]: any;
}

export const traverseNode = <T extends NodeItem = NodeItem>(
  node: T,
  cb: (node: T, parents: T[]) => void,
  parents: T[] = [],
) => {
  cb(node, parents);

  if (Array.isArray(node.items) && node.items.length) {
    parents.push(node);
    node.items.forEach((item) => {
      traverseNode(item as T, cb, [...parents]);
    });
  }
};

export const createPageNodeStatus = (
  nodeData: TreeNodeData[],
  initialLayerNodeStatus?: Map<string | number, LayerNodeStatus>,
) => {
  const map = new Map<string | number, LayerNodeStatus>();

  nodeData.forEach((node: NodeItem) =>
    traverseNode(node, (node) => {
      map.set(
        node.id,
        initialLayerNodeStatus?.get(node.id) || {
          visible: true,
          expand: false,
          selected: false,
          draggable: false,
        },
      );
    }),
  );

  return map;
};

export const useFilter = (
  nodeData: Ref<TreeNodeData[]>,
  nodeStatusMap: Ref<Map<string | number, LayerNodeStatus>>,
  filterNodeMethod: (value: string, data: any) => boolean,
) => {
  // tree方法：对树节点进行筛选时执行的方法
  const filterIsMatch = (value: string | string[], data: any): boolean => {
    const string = !Array.isArray(value) ? [value] : value;

    if (!string.length) {
      return true;
    }

    return string.some((v) => filterNodeMethod(v, data));
  };

  const oldNodeStatusMap = new Map();

  const filter = (text: string | string[]) => {
    if (!nodeData.value.length) return;

    nodeData.value.forEach((node) => {
      traverseNode(node, (node: any, parents: any[]) => {
        if (!nodeStatusMap.value) return;

        const visible = filterIsMatch(text, node);
        if (visible && parents.length) {
          parents.forEach((parent) => {
            updateStatus(nodeStatusMap.value, parent.id, {
              visible,
              expand: true,
            });
          });
        }

        updateStatus(nodeStatusMap.value, node.id, {
          visible,
        });
      });
    });
  };

  return {
    filterText: ref(''),
    filterTextChangeHandler(text: string | string[]) {
      if (!text) {
        oldNodeStatusMap.forEach((value, key) => {
          nodeStatusMap.value.set(key, value);
        });

        oldNodeStatusMap.clear();
        return;
      }

      if (!oldNodeStatusMap.size) {
        nodeStatusMap.value.forEach((value, key) => {
          oldNodeStatusMap.set(key, { ...value });
        });
      }

      filter(text);
    },
  };
};
