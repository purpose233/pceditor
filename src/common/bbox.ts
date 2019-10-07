import { Vector3, PerspectiveCamera } from 'three';

export class BoundingBox {

  private max: Vector3;
  private min: Vector3;

  constructor(max: Vector3, min: Vector3) {
    this.max = max;
    this.min = min;
  }

  public getMax(): Vector3 { return this.max; }

  public setMax(max: Vector3): void { this.max = max; }

  public getMin(): Vector3 { return this.min; }

  public setMin(min: Vector3): void { this.min = min; }

  public getSize(): Vector3 { return this.min.clone().negate().add(this.max); }

  public calcDistanceToPosition(position: Vector3): number {
    return this.max.clone().add(this.min).divideScalar(2).distanceTo(position);
  }

  public getVertices(): Vector3[] {
    const vertices: Vector3[] = [];
    vertices.push(new Vector3(this.min.x, this.min.y, this.min.z));
    vertices.push(new Vector3(this.min.x, this.min.y, this.max.z));
    vertices.push(new Vector3(this.min.x, this.max.y, this.min.z));
    vertices.push(new Vector3(this.min.x, this.max.y, this.max.z));
    vertices.push(new Vector3(this.max.x, this.min.y, this.min.z));
    vertices.push(new Vector3(this.max.x, this.min.y, this.max.z));
    vertices.push(new Vector3(this.max.x, this.max.y, this.min.z));
    vertices.push(new Vector3(this.max.x, this.max.y, this.max.z));
    return vertices; 
  }

  public checkInFrustum(camera: PerspectiveCamera): boolean {
    let flag: boolean = false;
    const vertices = this.getVertices();
    for (const vertex of vertices) {
      vertex.applyMatrix4(camera.matrixWorldInverse);
      if (vertex.z < camera.near && vertex.z > camera.far) {
        continue;
      }
      const planeHalfHeight = Math.abs(vertex.z) * Math.tan(camera.fov / 2);
      const planeHalfWidth = planeHalfHeight * camera.aspect;
      if (Math.abs(vertex.x) < planeHalfWidth && Math.abs(vertex.y) < planeHalfHeight) {
        flag = true; 
        break;
      }
    }
    return flag;
  }
}