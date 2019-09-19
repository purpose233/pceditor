import { BoundingBoxType } from '../common/types';
import { BasePoint } from './basePoint';
import { BaseNode } from './baseNode';

export abstract class BaseTree {

  protected bbox: BoundingBoxType; 
  protected rootNode: BaseNode;
  protected pointCount: number = 0;

  constructor(bbox: BoundingBoxType) {
    this.bbox = bbox;
    this.rootNode = this.createRootNode(bbox);
  }

  protected abstract createRootNode(bbox: BoundingBoxType): BaseNode;

  public addPoint(point: BasePoint): void {
    this.pointCount++;
    if (point.isInBBox(this.bbox)) {
      this.rootNode.addPoint(point);
    } else {
      // enlarge the bbox
    }
  }

  public getRootNode(): BaseNode { return this.rootNode; }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getPointCount(): number { return this.pointCount; }
}
