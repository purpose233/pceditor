import { BoundingBoxType } from '../common/types';
import { PCTreePoint } from './pcTreePoint';
import { PCTreeNode } from './pcTreeNode';

export class PCTree {
  private bbox: BoundingBoxType; 
  private rootNode: PCTreeNode;
  private pointCount: number = 0;

  constructor(bbox: BoundingBoxType) {
    this.bbox = bbox;
    this.rootNode = new PCTreeNode(bbox);
  }

  public addPoint(point: PCTreePoint): void {
    this.pointCount++;
    if (point.isInBBox(this.bbox)) {
      this.rootNode.addPoint(point);
    } else {
      // enlarge the bbox
    }
  }

  public getRootNode(): PCTreeNode { return this.rootNode; }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getPointCount(): number { return this.pointCount; }
}
