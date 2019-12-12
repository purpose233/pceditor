import { Vector3, Mesh } from 'three';

export interface ManifestType {
  projects: ConfigProjectType[]
}

export interface ConfigProjectType {
  id: string,
  name: string,
  path: string,
  lastModified: string
}

export interface SerializedBBoxType {
  minX: number, minY: number, minZ: number, 
  maxX: number, maxY: number, maxZ: number
}

export interface NodeIndexType {
  idx: string,
  bbox: SerializedBBoxType,
  mask: number, 
  childIndexes: (NodeIndexType | null)[],
  pointCount: number
}

export interface TreeIndexType {
  dataDir: string,
  bbox: SerializedBBoxType,
  // pointAttrs: [],
  pointCount: number,
  root: NodeIndexType
}

export type AxisType = 'x' | 'y' | 'z';

export interface ClosestPointOfLineResult {
  point0: Vector3,
  point1: Vector3,
  s: number,
  t: number,
  distance: number
};

export type GizmoMeshesType = {
  x: Mesh, y: Mesh, z: Mesh, 
  xh: Mesh, yh: Mesh, zh: Mesh
};

export interface RenderInfoType {
  nodes: number,
  points: number,
  selectedPoints: number,
  maxLoD: number,
  loadedNodes: number
};

export type SelectorNameType = null | 'boxSelector' | 'sphereSelector'; 

export type ToastType = 'info' | 'error' | 'warning' | 'success';
