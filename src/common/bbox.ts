import { Vector3, PerspectiveCamera, Matrix4, Vector2 } from 'three';

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

  // outdated way, could not check node containing frustum
  // public checkInFrustum(camera: PerspectiveCamera): boolean {
  //   let flag: boolean = false;
  //   const vertices = this.getVertices();
  //   const view = camera.position.clone();
  //   const lookAt = new Vector3();
  //   camera.getWorldDirection(lookAt);
  //   // the up vector which projects on the camera plane
  //   const up = camera.up.clone().projectOnPlane(lookAt).normalize();

  //   for (const vertex of vertices) {
  //     // vertex projects on the look at vector 
  //     const projectVertex = vertex.clone().projectOnVector(lookAt);
  //     // the distance between projected vertex and camera
  //     const distance = projectVertex.clone().add(view.clone().negate()).dot(lookAt);
  //     if (distance < camera.near && distance > camera.far) {
  //       continue;
  //     }
  //     // calculate field of view on look at plane
  //     const planeHalfHeight = Math.abs(distance) * Math.tan(camera.fov / 2);
  //     const planeHalfWidth = planeHalfHeight * camera.aspect;
  //     // the vector of projected vertex to vertex
  //     const v = vertex.clone().add(projectVertex.clone().negate());
  //     // height is the projecting length from v to up
  //     const height = Math.abs(v.clone().dot(up));
  //     const width = Math.sqrt(v.length() ** 2 - height ** 2);
  //     if (width < planeHalfWidth && height < planeHalfHeight) {
  //       flag = true; 
  //       break;
  //     }
  //   }
  //   return flag;
  // }

  public checkInFrustum(camera: PerspectiveCamera): boolean {
    let flag: boolean = false;
    // TODO: reuse the m matrix by passing it as parameter
    const mt = new Matrix4();
    mt.set(1,0,0,camera.position.x,
          0,1,0,camera.position.y,
          0,0,1,camera.position.z,
          0,0,0,1);
    const mz = new Matrix4();
    const { x: rx, y: ry, z: rz } = camera.rotation;
    mz.set(Math.cos(-rz),-Math.sin(-rz),0,0,
           Math.sin(-rz),Math.cos(-rz),0,0,
           0,0,1,0,
           0,0,0,1);
    const mx = new Matrix4();
    mx.set(1,0,0,0,
           0,Math.cos(-rx),-Math.sin(-rx),0,
           0,Math.sin(-rx),Math.cos(-rx),0,
           0,0,0,1);
    const my = new Matrix4();
    my.set(Math.cos(-ry),0,Math.sin(-ry),0,
           0,1,0,0,
           -Math.sin(-ry),0,Math.cos(-ry),0,
           0,0,0,1);
    const m = mz.multiply(my).multiply(mx).multiply(mt);
    const pVertices: Vector3[] = [];
    for (const vertex of this.getVertices()) {
      // transform to camera coordinate
      vertex.applyMatrix4(m);
      // project to -1/1 plane
      vertex.divideScalar(vertex.z);
      pVertices.push(vertex);
    }
    
    const planeHalfHeight = 1 * Math.tan(camera.fov / 2);
    const planeHalfWidth = planeHalfHeight * camera.aspect;
    const faces = [
      [pVertices[0],pVertices[1],pVertices[3],pVertices[2]],
      [pVertices[0],pVertices[1],pVertices[5],pVertices[4]],
      [pVertices[4],pVertices[5],pVertices[7],pVertices[6]],
      [pVertices[2],pVertices[3],pVertices[7],pVertices[6]],
      [pVertices[1],pVertices[3],pVertices[7],pVertices[5]],
      [pVertices[0],pVertices[2],pVertices[6],pVertices[4]]
    ]
    // Cuz the vertices will be project to plane 1 or plane -1,
    //  the current algorithm might add some wrong results. 
    for (const face of faces) {
      if (this.checkFaceInWindow(face, planeHalfWidth, planeHalfHeight)) { return true; }
    }
    return flag;
  }

  private checkFaceInWindow(face: Vector3[], hWidth: number, hHeight: number): boolean {
    // at least one face vertex should lie on -1 plane
    // let flag: boolean = false;
    // for (const vertex of face) {
    //   flag = vertex.z < 0 ? true : flag;
    // }
    // if (!flag) { return false; }

    // check face vertices in window
    for (const vertex of face) {
      if (Math.abs(vertex.x) <= hWidth && Math.abs(vertex.y) <= hHeight) {
        return true;
      }
    }

    // check window vertices in face
    const windowVertice = [
      new Vector2(hWidth, hHeight),
      new Vector2(hWidth, -hHeight),
      new Vector2(-hWidth, -hHeight),
      new Vector2(-hWidth, hHeight)
    ];
    for (const wVertex of windowVertice) {
      const dot0 = new Vector2(face[0].x-wVertex.x,face[0].y-wVertex.y)
        .dot(new Vector2(face[1].x-face[0].x,face[1].y-face[0].y));
      const dot1 = new Vector2(face[1].x-wVertex.x,face[1].y-wVertex.y)
        .dot(new Vector2(face[2].x-face[1].x,face[2].y-face[1].y));
      const dot2 = new Vector2(face[2].x-wVertex.x,face[2].y-wVertex.y)
        .dot(new Vector2(face[3].x-face[2].x,face[3].y-face[2].y));
      const dot3 = new Vector2(face[3].x-wVertex.x,face[3].y-wVertex.y)
        .dot(new Vector2(face[0].x-face[3].x,face[0].y-face[3].y));
      if (dot0 >= 0 && dot1 >= 0 && dot2 >= 0 && dot3 >= 0) {
        return true;
      }
      if (dot0 <= 0 && dot1 <= 0 && dot2 <= 0 && dot3 <= 0) {
        return true;
      }
    }

    // check face edges cross window
    const lines = [
      [face[0], face[1]],
      [face[1], face[2]],
      [face[2], face[3]],
      [face[3], face[0]]
    ];
    for (const line of lines) {
      if (line[0].x === line[1].x) {
        if (Math.abs(line[0].x) === hWidth) { return true; } else { continue; }
      }
      if (line[0].y === line[1].y) {
        if (Math.abs(line[0].y) === hHeight) { return true; } else { continue; }
      }
      const x1 = (hHeight-line[0].y)/(line[1].y-line[0].y)*(line[1].x-line[0].x)+line[0].x;
      if (Math.abs(x1) <= hWidth && x1 >= Math.min(line[0].x, line[1].x) && x1 <= Math.max(line[0].x, line[1].x)) { return true; }
      const x2 = (-hHeight-line[0].y)/(line[1].y-line[0].y)*(line[1].x-line[0].x)+line[0].x;
      if (Math.abs(x2) <= hWidth && x2 >= Math.min(line[0].x, line[1].x) && x2 <= Math.max(line[0].x, line[1].x)) { return true; }
      const y1 = (hWidth-line[0].x)/(line[1].x-line[0].x)*(line[1].y-line[0].y)+line[0].y;
      if (Math.abs(y1) <= hHeight && y1 >= Math.min(line[0].y, line[1].y) && y1 <= Math.max(line[0].y, line[1].y)) { return true; }
      const y2 = (-hWidth-line[0].x)/(line[1].x-line[0].x)*(line[1].y-line[0].y)+line[0].y;
      if (Math.abs(y2) <= hHeight && y2 >= Math.min(line[0].y, line[1].y) && y2 <= Math.max(line[0].y, line[1].y)) { return true; }
    }

    return false;
  }
}
