import { MNOTree } from '../tree/mnoTree';
import { BoundingBoxType } from '../common/types';
import { MNONode } from '../tree/mnoNode';
import { RenderNode } from './renderNode';

export class RenderTree extends MNOTree {

  constructor(bbox: BoundingBoxType) {
    super(RenderTree.createRootNode(bbox), bbox);
  }

  protected static createRootNode(bbox: BoundingBoxType): MNONode {
    return new RenderNode('0', bbox, null, false);
  }
}
