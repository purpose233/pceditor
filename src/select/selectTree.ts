import { OctreeTree } from '../tree/octreeTree';
import { SelectNode } from './selectNode';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';

export class SelectTree extends OctreeTree {

  // private selector: BaseSelector;
  // Whether the select tree has been changed.
  // private isDirty: boolean = false;

  constructor(refMNOTree: RenderTree) {
    super(SelectTree.createRootNode(refMNOTree));
  }
  
  protected static createRootNode(refMNOTree: RenderTree): SelectNode {
    const mnoRoot = refMNOTree.getRootNode() as RenderNode;
    return new SelectNode(mnoRoot.getIdx(), null, mnoRoot);
  }
}
