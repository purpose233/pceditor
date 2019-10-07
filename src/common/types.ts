import { Vector3 } from 'three';

export interface SerializedBBoxType {
  minX: number, minY: number, minZ: number, 
  maxX: number, maxY: number, maxZ: number
}

export interface NodeIndexType {
  idx: string,
  bbox: SerializedBBoxType,
  mask: number, 
  childIndexes: (NodeIndexType | null)[]
}

export interface TreeIndexType {
  dataDir: string,
  bbox: SerializedBBoxType,
  // pointAttrs: [],
  pointCount: number,
  root: NodeIndexType
}

// TODO: set BoundingBox to class
// export interface BoundingBoxType {
//   min: Vector3,
//   max: Vector3
// }
