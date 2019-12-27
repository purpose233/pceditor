import { OctreeTree } from './octreeTree';
import { MNOPoint } from './mnoPoint';
import { MNONode } from './mnoNode';
import { BoundingBox } from '../common/bbox';

export abstract class MNOTree extends OctreeTree {

  protected bbox: BoundingBox; 

  constructor(refPath: string, root: MNONode, bbox: BoundingBox) {
    super(refPath, root);
    this.bbox = bbox;
  }

  public addPoint(point: MNOPoint): void {
    if (point.isInBBox(this.bbox)) {
      (this.rootNode as MNONode).addPoint(point);
    } else {
      // enlarge the bbox
    }
  }

  public getBBox(): BoundingBox { return this.bbox; }

  public getPointCount(): number { return (this.rootNode as MNONode).getSubtreePointCount(); }
}
