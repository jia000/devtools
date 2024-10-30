/** 组件树节点状态 */
export interface LayerNodeStatus {
  /** 显隐 */
  visible: boolean;
  /** 展开子节点 */
  expand: boolean;
  /** 选中 */
  selected: boolean;
  /** 是否可拖拽 */
  draggable: boolean;
}

export interface TreeNodeData {
  id: string | number;
  name?: string;
  items?: TreeNodeData[];
  [key: string]: any;
}
