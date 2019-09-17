import { BoundingBoxType, SerializedBBoxType } from './types';
import { Vector3 } from 'three';

export function serializedbboxToBBoxType(sbbox: SerializedBBoxType): BoundingBoxType {
  return {
    max: new Vector3(sbbox.maxX, sbbox.maxY, sbbox.maxZ),
    min: new Vector3(sbbox.minX, sbbox.minY, sbbox.minZ)
  };
}

export function bboxToSerializedbboxType(bbox: BoundingBoxType): SerializedBBoxType {
  return {
    minX: bbox.min.x, minY: bbox.min.y, minZ: bbox.min.z,
    maxX: bbox.max.x, maxY: bbox.max.y, maxZ: bbox.max.z
  }
}
