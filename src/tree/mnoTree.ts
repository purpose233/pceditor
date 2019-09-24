import { OctreeTree } from './octreeTree';
import { BoundingBoxType } from '../common/types';
import { MNOPoint } from './mnoPoint';
import { MNONode } from './mnoNode';

export abstract class MNOTree extends OctreeTree {

  protected bbox: BoundingBoxType; 
  protected pointCount: number = 0;

  constructor(root: MNONode, bbox: BoundingBoxType) {
    super(root);
    this.bbox = bbox;
  }

  public addPoint(point: MNOPoint): void {
    this.pointCount++;
    if (point.isInBBox(this.bbox)) {
      (this.rootNode as MNONode).addPoint(point);
    } else {
      // enlarge the bbox
    }
  }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getPointCount(): number { return this.pointCount; }
}
