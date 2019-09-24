import { BoundingBoxType } from './types';
import { Vector3, PerspectiveCamera } from 'three';

export function calcDistanceToBBox(position: Vector3, bbox: BoundingBoxType): number {
  return bbox.max.clone().add(bbox.min).divideScalar(2).distanceTo(position);
}

// export function checkPointInBBox(positino: Vector3, bbox: BoundingBoxType): boolean {
//   return true;
// }

export function getVerticesOfBBox(bbox: BoundingBoxType): Vector3[] {
  const vertices: Vector3[] = [];
  vertices.push(new Vector3(bbox.min.x, bbox.min.y, bbox.min.z));
  vertices.push(new Vector3(bbox.min.x, bbox.min.y, bbox.max.z));
  vertices.push(new Vector3(bbox.min.x, bbox.max.y, bbox.min.z));
  vertices.push(new Vector3(bbox.min.x, bbox.max.y, bbox.max.z));
  vertices.push(new Vector3(bbox.max.x, bbox.min.y, bbox.min.z));
  vertices.push(new Vector3(bbox.max.x, bbox.min.y, bbox.max.z));
  vertices.push(new Vector3(bbox.max.x, bbox.max.y, bbox.min.z));
  vertices.push(new Vector3(bbox.max.x, bbox.max.y, bbox.max.z));
  return vertices;
}

export function checkBBoxInFrustum(bbox: BoundingBoxType, camera: PerspectiveCamera): boolean {
  let flag: boolean = false;
  const vertices = getVerticesOfBBox(bbox);
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
