import { BoundingBoxType } from './types';
import { Vector3, PerspectiveCamera, Points, BufferGeometry, BufferAttribute, PointsMaterial, VertexColors } from 'three';
import { RenderNode } from '../render/renderNode';
import { BasePoint } from '../tree/basePoint';

export function createNodeMesh(node: RenderNode): Points {
  const pointCount = node.getPointCount();
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);
  node.travelPoints((p: BasePoint, i: number): void => {
    const position = p.getPosition();
    positions[3 * i] = position.x;
    positions[3 * i + 1] = position.y;
    positions[3 * i + 2] = position.z;
    colors[3 * i] = 1;
    colors[3 * i + 1] = 1;
    colors[3 * i + 2] = 1
  });
  const geometry = new BufferGeometry();
  geometry.addAttribute('position', new BufferAttribute(positions, 3));
  geometry.addAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeBoundingBox();
  const material = new PointsMaterial({size: 0.05, vertexColors: VertexColors});
  return new Points(geometry, material);
}

export function calcDistanceToBBox(position: Vector3, bbox: BoundingBoxType): number {
  return bbox.max.clone().add(bbox.min).divideScalar(2).distanceTo(position);
}

// export function checkPointInBBox(positino: Vector3, bbox: BoundingBoxType): boolean {
//   return true;
// }

export function checkBBoxInFrustum(bbox: BoundingBoxType, camera: PerspectiveCamera): boolean {
  const bboxPoints: Vector3[] = [];
  bboxPoints.push(new Vector3(bbox.min.x, bbox.min.y, bbox.min.z));
  bboxPoints.push(new Vector3(bbox.min.x, bbox.min.y, bbox.max.z));
  bboxPoints.push(new Vector3(bbox.min.x, bbox.max.y, bbox.min.z));
  bboxPoints.push(new Vector3(bbox.min.x, bbox.max.y, bbox.max.z));
  bboxPoints.push(new Vector3(bbox.max.x, bbox.min.y, bbox.min.z));
  bboxPoints.push(new Vector3(bbox.max.x, bbox.min.y, bbox.max.z));
  bboxPoints.push(new Vector3(bbox.max.x, bbox.max.y, bbox.min.z));
  bboxPoints.push(new Vector3(bbox.max.x, bbox.max.y, bbox.max.z));
  let flag: boolean = false;
  for (const point of bboxPoints) {
    point.applyMatrix4(camera.matrixWorldInverse);
    if (point.z < camera.near && point.z > camera.far) {
      continue;
    }
    const planeHalfHeight = Math.abs(point.z) * Math.tan(camera.fov / 2);
    const planeHalfWidth = planeHalfHeight * camera.aspect;
    if (Math.abs(point.x) < planeHalfWidth && Math.abs(point.y) < planeHalfHeight) {
      flag = true; 
      break;
    }
  }
  return flag;
}
