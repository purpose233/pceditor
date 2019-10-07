import { SerializedBBoxType } from './types';
import { Vector3 } from 'three';
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
