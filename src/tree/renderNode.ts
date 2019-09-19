import { BaseNode } from './baseNode';
import { BoundingBoxType } from '../common/types';
import { BasePoint } from './basePoint';

export class RenderNode extends BaseNode{
  
  protected createNode(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode, 
                       points?: BasePoint[]): BaseNode {
    return new RenderNode(idx, bbox, parentNode, points);
  };
}
