import { OctreeNode } from '../tree/octreeNode';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';

export class SelectNode extends OctreeNode {
  
  private refMNONode: RenderNode;
  private isDirty: boolean = false;
  private grid: Map<number, RenderPoint> = new Map();
  // store points in eight stacks of render node
  private stack: RenderPoint[] = [];

  constructor(idx: string, parentNode: SelectNode | null, refMNONode: RenderNode) {
    super(idx, parentNode);
    this.refMNONode = refMNONode;
  }
}
