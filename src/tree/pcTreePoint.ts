import { Vector3 } from 'three';
import { BoundingBoxType } from '../common/types';

export class PCTreePoint {
  private position: Vector3;
  // color?: 

  constructor(position: Vector3) {
    this.position = position;
  }

  public getPosition(): Vector3 { return this.position; }

  public isInBBox(bbox: BoundingBoxType): boolean {
    return this.position.x > bbox.min.x && this.position.x < bbox.max.x 
      && this.position.y > bbox.min.y && this.position.y < bbox.max.y 
      && this.position.z > bbox.min.z && this.position.z < bbox.max.z;
  }
}
