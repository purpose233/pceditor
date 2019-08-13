import fs from 'fs';
import { PCTree, PCTreeNode } from './pcTree';
import { PCTreeIndexType } from './types';

export function serializeIndex(filePath: string, tree: PCTree): Promise<void> {
  return new Promise((resolve) => {
    const bbox = tree.getBBox();
    const index: PCTreeIndexType = {
      dataDir: './data',
      bbox: { minX: bbox.min.x, minY: bbox.min.y, minZ: bbox.min.z,
              maxX: bbox.max.x, maxY: bbox.max.y, maxZ: bbox.max.z, },
      pointCount: tree.getPointCount()
    };
    fs.writeFile(filePath, JSON.stringify(index), () => { resolve(); });
  });
}

export function serializeNode(filePath: string, node: PCTreeNode): Promise<void> {
  return new Promise((resolve) => {
    const bbox = node.getBBox(), grid = node.getGrid(), stacks = node.getStacks();
    const size = 4 * 6 + 1 + 4 + (12 + 4) * grid.size + 2 * 8 + 12 * node.getStackCount();
    const buffer = Buffer.alloc(size);
    let offset = 0;
  
    buffer.writeFloatBE(bbox.min.x, offset); offset += 4;
    buffer.writeFloatBE(bbox.min.y, offset); offset += 4;
    buffer.writeFloatBE(bbox.min.z, offset); offset += 4;
    buffer.writeFloatBE(bbox.max.x, offset); offset += 4;
    buffer.writeFloatBE(bbox.max.y, offset); offset += 4;
    buffer.writeFloatBE(bbox.max.z, offset); offset += 4;
  
    buffer.writeUInt8(node.getChildrenMask(), offset); offset += 1;
  
    buffer.writeUInt32BE(grid.size, offset); offset += 4;
    const gridIter = grid.entries();
    let result;
    while (!(result = gridIter.next()).done) {
      const gridNumber = result.value[0], position = result.value[1].getPosition();
      buffer.writeUInt32BE(gridNumber, offset); offset += 4;
      buffer.writeFloatBE(position.x, offset); offset += 4;
      buffer.writeFloatBE(position.y, offset); offset += 4;
      buffer.writeFloatBE(position.z, offset); offset += 4;
    }
  
    for (const stack of stacks) {
      buffer.writeUInt16BE(stack.length, offset); offset += 2;
    }
    for (const stack of stacks) {
      for (const point of stack) {
        const position = point.getPosition();
        buffer.writeFloatBE(position.x, offset); offset += 4;
        buffer.writeFloatBE(position.y, offset); offset += 4;
        buffer.writeFloatBE(position.z, offset); offset += 4;
      }
    }
  
    fs.writeFile(filePath, buffer, () => { resolve(); });
  });
}

// export function deserializeIndex(filePath: string): PCTree {

// }

// export function deserializeNode(filePath: string): PCTreeNode {}
