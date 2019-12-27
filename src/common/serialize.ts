import fs from 'fs';
import { TreeIndexType, NodeIndexType } from './types';
import { serializedbboxToBBoxType, readFileP } from './common';
import { Vector3 } from 'three';
import { MNONode } from '../tree/mnoNode';
import { MNOTree } from '../tree/mnoTree';
import { ConverterNode } from '../converter/converterNode';
import { RenderNode } from '../render/renderNode';
import { ConverterTree } from '../converter/converterTree';
import { RenderTree } from '../render/renderTree';
import { ConverterPoint } from '../converter/converterPoint';
import { RenderPoint } from '../render/renderPoint';

// TODO: use stream to improve the usage of rom

export async function serializeTree(tree: MNOTree): Promise<void> {
  async function handleNode(node: MNONode): Promise<void> {
    await serializeNode(tree.getRefDataPath() + node.getIdx(), node);
    for (const childNode of node.getChildNodes() as MNONode[]) {
      await handleNode(childNode);
    }
  }

  await serializeIndex(tree.getRefIndexPath(), tree);
  await handleNode(tree.getRootNode() as MNONode);  
}

export function serializeIndex(filePath: string, tree: MNOTree): Promise<void> {
  return new Promise((resolve) => {
    const bbox = tree.getBBox();
    const min = bbox.getMin(), max = bbox.getMax();
    const index: TreeIndexType = {
      dataDir: './data',
      bbox: { minX: min.x, minY: min.y, minZ: min.z,
              maxX: max.x, maxY: max.y, maxZ: max.z, },
      pointCount: tree.getPointCount(),
      root: (tree.getRootNode() as MNONode).getIndex()
    };
    fs.writeFile(filePath, JSON.stringify(index), () => { resolve(); });
  });
}

export function serializeNode(filePath: string, node: MNONode): Promise<void> {
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
    for (const stack of stacks) {
      buffer.writeUInt16BE(stack.length, offset); offset += 2;
    }
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

export function deserializeIndex(refPath: string, filePath: string, isConvertering: boolean = false): Promise<MNOTree> {

  function handleNode(idx: string, index: NodeIndexType, parentNode: MNONode, tree: MNOTree): MNONode {
    const node = isConvertering ? new ConverterNode(idx, serializedbboxToBBoxType(index.bbox), parentNode as ConverterNode, 
                                                    tree as ConverterTree, false) 
                                : new RenderNode(idx, serializedbboxToBBoxType(index.bbox), parentNode as RenderNode, 
                                                 tree as RenderTree, false);
    node.setPointCount(index.pointCount);
    for (let i = 0; i < 8; i++) {
      if (index.mask & (1 << i)) {
        node.setChildNode(i, handleNode(idx + i, index.childIndexes[i] as NodeIndexType, node, tree));
      }
    }
    return node;
  }

  return readFileP(filePath, (buffer: Buffer) => {
    const treeIndex: TreeIndexType = JSON.parse(buffer.toString());
    // const tree = new BaseTree(serializedbboxToBBoxType(treeIndex.bbox));
    const tree = isConvertering ? new ConverterTree(refPath, serializedbboxToBBoxType(treeIndex.bbox)) 
                                : new RenderTree(refPath, serializedbboxToBBoxType(treeIndex.bbox));
    const rootNode = tree.getRootNode(), mask = treeIndex.root.mask;
    (rootNode as MNONode).setPointCount(treeIndex.root.pointCount);
    for (let i = 0; i < 8; i++) {
      if (mask & (1 << i)) {
        const childNode = handleNode('0' + i, treeIndex.root.childIndexes[i] as NodeIndexType, 
                                     rootNode as MNONode, tree);
        rootNode.setChildNode(i, childNode);
      }
    }
    return tree;
  });
}

// TODO: return flag or throw error if node file don't exist or is not valid.
export function deserializeNode(filePath: string, node: MNONode, isConvertering: boolean = false): Promise<void> {
  return readFileP(filePath, (buffer: Buffer) => {
    let offset = 0;
    const gridCount = buffer.readUInt32BE(offset); offset += 4;
    const stackCounts: number[] = [];
    for (let i = 0; i < 8; i++) {
      stackCounts[i] = buffer.readUInt16BE(offset); offset += 2;
    }
    for (let i = 0; i < gridCount; i++) {
      const gridNumber = buffer.readUInt32BE(offset); offset += 4;
      const x = buffer.readFloatBE(offset); offset += 4;
      const y = buffer.readFloatBE(offset); offset += 4;
      const z = buffer.readFloatBE(offset); offset += 4;
      node.addPointToGrid(gridNumber, isConvertering ? new ConverterPoint(new Vector3(x, y, z)) 
                                                     : new RenderPoint(new Vector3(x, y, z)));
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < stackCounts[i]; j++) {
        const x = buffer.readFloatBE(offset); offset += 4;
        const y = buffer.readFloatBE(offset); offset += 4;
        const z = buffer.readFloatBE(offset); offset += 4;
        node.addPointToStack(i, isConvertering ? new ConverterPoint(new Vector3(x, y, z)) 
                                               : new RenderPoint(new Vector3(x, y, z)));
      }
    }
  });
}
