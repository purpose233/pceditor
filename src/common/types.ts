import { Vector3 } from 'three';

export interface SerializedBBoxType {
  minX: number, minY: number, minZ: number, 
  maxX: number, maxY: number, maxZ: number
}

export interface PCTreeNodeIndexType {
  idx: string,
  bbox: SerializedBBoxType,
  mask: number, 
  childIndexes: (PCTreeNodeIndexType | null)[]
}

export interface PCTreeIndexType {
  dataDir: string,
  bbox: SerializedBBoxType,
  // pointAttrs: [],
  pointCount: number,
  root: PCTreeNodeIndexType
}

export interface BoundingBoxType {
  min: Vector3,
  max: Vector3
}
