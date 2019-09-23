import { BaseTree } from './baseTree';
import { BoundingBoxType } from '../common/types';
import { BaseNode } from './baseNode';
import { RenderNode } from './renderNode';

export class RenderTree extends BaseTree {

  protected createRootNode(bbox: BoundingBoxType): BaseNode {
    return new RenderNode('0', bbox, null, false);
  }
}
