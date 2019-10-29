import { Vector3, Color } from 'three';
import { DefaultPointColor } from '../common/constants';
import { BoundingBox } from '../common/bbox';

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

  public isInBBox(bbox: BoundingBox): boolean {
  const min = bbox.getMin(), max = bbox.getMax();
  return this.position.x >= min.x && this.position.x <= max.x 
      && this.position.y >= min.y && this.position.y <= max.y 
      && this.position.z >= min.z && this.position.z <= max.z;
  }
}
