import { Vector3 } from 'three';

export interface PCTreeIndexType {
  dataDir: string,
  bbox: {
    minX: number, minY: number, minZ: number, 
    maxX: number, maxY: number, maxZ: number
  },
  // pointAttrs: [],
  pointCount: number
}

export interface BoundingBoxType {
  min: Vector3,
  max: Vector3
}
