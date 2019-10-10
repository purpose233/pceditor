import { SerializedBBoxType } from './types';
import { Vector3, Camera, Matrix4 } from 'three';
import { BoundingBox } from './bbox';

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
