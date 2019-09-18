import fs from 'fs';
import { RenderTree } from '../tree/renderTree';
import { RenderNode } from '../tree/renderNode';
import { PCTreeIndexType, PCTreeNodeIndexType } from './types';
import { serializedbboxToBBoxType } from './common';
import { BasePoint } from '../tree/basePoint';
import { Vector3 } from 'three';
import { BaseNode } from '../tree/baseNode';

export async function serializeTree(tree: RenderTree): Promise<void> {
  const indexPath = '../../output/index';
  const nodePath = '../../output/n';

  async function handleNode(node: RenderNode): Promise<void> {
    await serializeNode(nodePath + node.getIdx, node);
    for (const childNode of node.getChildNodes()) {
      await handleNode(childNode);
    }
  }

  await serializeIndex(indexPath, tree);
  await handleNode(tree.getRootNode());  
}

export function serializeIndex(filePath: string, tree: RenderTree): Promise<void> {
  return new Promise((resolve) => {
    const bbox = tree.getBBox();
    const index: PCTreeIndexType = {
      dataDir: './data',
      bbox: { minX: bbox.min.x, minY: bbox.min.y, minZ: bbox.min.z,
              maxX: bbox.max.x, maxY: bbox.max.y, maxZ: bbox.max.z, },
      pointCount: tree.getPointCount(),
      root: tree.getRootNode().getIndex()
    };
    fs.writeFile(filePath, JSON.stringify(index), () => { resolve(); });
  });
}

export function serializeNode(filePath: string, node: RenderNode): Promise<void> {
  return new Promise((resolve) => {
    const grid = node.getGrid(), stacks = node.getStacks();
    const size = 4 * 6 + 1 + 4 + (12 + 4) * grid.size + 2 * 8 + 12 * node.getStackCount();
    const buffer = Buffer.alloc(size);
    let offset = 0;
  
    // buffer.writeFloatBE(bbox.min.x, offset); offset += 4;
    // buffer.writeFloatBE(bbox.min.y, offset); offset += 4;
    // buffer.writeFloatBE(bbox.min.z, offset); offset += 4;
    // buffer.writeFloatBE(bbox.max.x, offset); offset += 4;
    // buffer.writeFloatBE(bbox.max.y, offset); offset += 4;
    // buffer.writeFloatBE(bbox.max.z, offset); offset += 4;
  
    // buffer.writeUInt8(node.getChildrenMask(), offset); offset += 1;
  
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

export function readFileP<T>(filePath: string, handler: (buffer: Buffer)=>T): Promise<T> {
  return new Promise((resolve) => {
    const rs = fs.createReadStream(filePath);
    const chunks: Buffer[] = [];
    rs.on('data', function(chunk: Buffer) {
      chunks.push(chunk);
    });
    rs.on('readable', () => {});
    rs.on('end', () => {
      resolve(handler(Buffer.concat(chunks)));
    });
  });
}

export function deserializeIndex(filePath: string): Promise<RenderTree> {

  function handleNode(idx: string, index: PCTreeNodeIndexType, parentNode: BaseNode): RenderNode {
    const node = new BaseNode(idx, serializedbboxToBBoxType(index.bbox), parentNode);
    for (let i = 0; i < 8; i++) {
      if (index.mask & (1 << i)) {
        node.setChildNode(i, handleNode(idx + i, <PCTreeNodeIndexType>index.childIndexes[i], node));
      }
    }
    return node;
  }

  return readFileP(filePath, (buffer: Buffer) => {
    const treeIndex: PCTreeIndexType = JSON.parse(buffer.toString());
    const tree = new RenderTree(serializedbboxToBBoxType(treeIndex.bbox));
    const rootNode = tree.getRootNode(), mask = treeIndex.root.mask;
    for (let i = 0; i < 8; i++) {
      if (mask & (1 << i)) {
        const childNode = handleNode('0' + i, <PCTreeNodeIndexType>treeIndex.root.childIndexes[i], rootNode);
        rootNode.setChildNode(i, childNode);
      }
    }
    return tree;
  });
}

export function deserializeNode(filePath: string, node: RenderNode): Promise<void> {
  return readFileP(filePath, (buffer: Buffer) => {
    let offset = 0;
    const gridCount = buffer.readUInt32BE(offset); offset += 4;
    for (let i = 0; i < gridCount; i++) {
      const gridNumber = buffer.readUInt32BE(offset); offset += 4;
      const x = buffer.readFloatBE(offset); offset += 4;
      const y = buffer.readFloatBE(offset); offset += 4;
      const z = buffer.readFloatBE(offset); offset += 4;
      node.addPointToGrid(gridNumber, new BasePoint(new Vector3(x, y, z)));
    }
    const stackCounts: number[] = [];
    for (let i = 0; i < 8; i++) {
      stackCounts[i] = buffer.readUInt16BE(offset); offset += 2;
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < stackCounts[i]; j++) {
        const x = buffer.readFloatBE(offset); offset += 4;
        const y = buffer.readFloatBE(offset); offset += 4;
        const z = buffer.readFloatBE(offset); offset += 4;
        node.addPointToStack(i, new BasePoint(new Vector3(x, y, z)));
      }
    }
  });
}
