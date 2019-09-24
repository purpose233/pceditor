import { Vector3, Color } from 'three';
import { BoundingBoxType } from '../common/types';
import { DefaultPointColor } from '../common/constants';

export abstract class MNOPoint {
  
  protected position: Vector3;
  protected color?: Color;

  constructor(position: Vector3) {
    this.position = position;
  }

  public getPosition(): Vector3 { return this.position; }

  public getColor(): Color {
    return this.color ? this.color : DefaultPointColor;
  }

  public isInBBox(bbox: BoundingBoxType): boolean {
    return this.position.x > bbox.min.x && this.position.x < bbox.max.x 
      && this.position.y > bbox.min.y && this.position.y < bbox.max.y 
      && this.position.z > bbox.min.z && this.position.z < bbox.max.z;
  }
}
