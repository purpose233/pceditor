import fs from 'fs';
import { SerializedBBoxType, ClosestPointOfLineResult, AxisType } from './types';
import { Vector3, Camera, Matrix4 } from 'three';
import { BoundingBox } from './bbox';

export function readFileP<T>(filePath: string, handler: (buffer: Buffer)=>T): Promise<T> {
  return new Promise((resolve) => {
    fs.readFile(filePath, (err: any, data: Buffer) => {
      resolve(handler(data));
    })
    // const rs = fs.createReadStream(filePath);
    // const chunks: Buffer[] = [];
    // rs.on('data', function(chunk: Buffer) {
    //   chunks.push(chunk);
    // });
    // rs.on('readable', () => {});
    // rs.on('end', () => {
    //   resolve(handler(Buffer.concat(chunks)));
    // });
  });
}

export function serializedbboxToBBoxType(sbbox: SerializedBBoxType): BoundingBox {
  return new BoundingBox(
    new Vector3(sbbox.maxX, sbbox.maxY, sbbox.maxZ),
    new Vector3(sbbox.minX, sbbox.minY, sbbox.minZ)
  );
}

export function bboxToSerializedbboxType(bbox: BoundingBox): SerializedBBoxType {
  const min = bbox.getMin(), max = bbox.getMax();
  return {
    minX: min.x, minY: min.y, minZ: min.z,
    maxX: max.x, maxY: max.y, maxZ: max.z
  }
}

export function calcWorldToCameraMatrix(camera: Camera): Matrix4 {
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
  return mz.multiply(my).multiply(mx).multiply(mt);
}

// TODO: generalize the presentation of line
export function calcClosestPointOfLines(origin0: Vector3, direction0: Vector3, 
                                        origin1: Vector3, direction1: Vector3): ClosestPointOfLineResult | null {
  // Solution:
  //   P = o0 + s * d0; Q = o1 + t * d1;
  //   (Q - P) * d0 = 0; (Q - P) * d1 = 0;
  //   (o1 - o0) * d0 + t * d1 * d0 - s * d0 * d0 = 0;
  //   (o1 - o0) * d1 + t * d1 * d1 - s * d0 * d1 = 0;
  //   let a = (o1 - o0) * d0, b = (o1 - o0) * d1,
  //       c = d0 * d0, d = d1 * d1, e = d0 * d1;
  //   s = (a + e * t) / c;
  //   t = (e * a / c - b) / (d - e * e / c);
  
  // TODO: normalize direction vectors
  const o2 = origin1.clone().sub(origin0.clone());
  const a = o2.dot(direction0), b = o2.dot(direction1), c = direction0.dot(direction0), 
        d = direction1.dot(direction1), e = direction0.dot(direction1);
  if (c === 0 || d - e * e / c === 0) { return null; }
  const t = (e * a / c - b) / (d - e * e / c);
  const s = (a + e * t) / c;
  const P = origin0.clone().add(direction0.multiplyScalar(s));
  const Q = origin1.clone().add(direction1.multiplyScalar(t));
  const distance = P.distanceTo(Q);
  return { point0: P, point1: Q, s, t, distance };
}

export function getDirectionByAxis(axis: AxisType, isNegative: boolean = false): Vector3 {
  switch (axis) {
    case 'x': return new Vector3(isNegative ? -1 : 1, 0, 0);
    case 'y': return new Vector3(0, isNegative ? -1 : 1, 0);
    case 'z': return new Vector3(0, 0, isNegative ? -1 : 1);
  }
}
