import fs from 'fs';
import { readFileP } from '../common/common';
import { RenderTree } from '../render/renderTree';
import { RenderNode } from '../render/renderNode';
import { MNOPoint } from '../tree/mnoPoint';

export async function exportToPCD(filePath: string, renderTree: RenderTree): Promise<void> {
  const stack = [renderTree.getRootNode() as RenderNode];
  const ws = fs.createWriteStream(filePath);
  ws.setDefaultEncoding('utf-8');
  const head = 
`# .PCD v0.7 - Point Cloud Data file format
VERSION 0.7
FIELDS x y z
SIZE 4 4 4
TYPE F F F
COUNT 1 1 1
WIDTH ${renderTree.getPointCount()}
HEIGHT 1
VIEWPOINT 0 0 0 1 0 0 0
POINTS ${renderTree.getPointCount()}
DATA ascii
`;
  const waiting = ws.write(head);
  await writeNode(ws, stack, waiting);
  ws.end();
}

export function writeNode(writeStream: fs.WriteStream, stack: RenderNode[], waiting: boolean): Promise<void> {
  if (stack.length <= 0) { return Promise.resolve(); }
  
  function getNodeStr(): Promise<string> {
    return new Promise(async (resolve) => {
      let str: string = '';
      const renderNode = stack.shift() as RenderNode;
      stack.push(...renderNode.getChildNodes() as RenderNode[]);
      if (renderNode.checkIsLoaded()) {
        renderNode.travelPoints((point: MNOPoint, index: number) => {
          const {x, y, z} = point.getPosition();
          str += x.toPrecision(8) + ' ' + y.toPrecision(8) + ' ' + z.toPrecision(8) + '\n';
        });
      } else {
        str = await stringifyNodeToPCD(renderNode.getFilePath());
      }
      resolve(str);
    });
  }

  if (!waiting) {
    return Promise.all([waitWriteStream(writeStream), getNodeStr()])
      .then((values: [void, string]) => writeStream.write(values[1]))
      .then((next: boolean) => writeNode(writeStream, stack, next));
  } else {
    return Promise.resolve(getNodeStr())
      .then((value: string) => writeStream.write(value))
      .then((next: boolean) => writeNode(writeStream, stack, next));
  }
}

function stringifyNodeToPCD(filePath: string): Promise<string> {
  return readFileP(filePath, (buffer: Buffer) => {
    let offset = 0, str = '';
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
      str += x.toPrecision(8) + ' ' + y.toPrecision(8) + ' ' + z.toPrecision(8) + '\n';
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < stackCounts[i]; j++) {
        const x = buffer.readFloatBE(offset); offset += 4;
        const y = buffer.readFloatBE(offset); offset += 4;
        const z = buffer.readFloatBE(offset); offset += 4;
        str += x.toPrecision(8) + ' ' + y.toPrecision(8) + ' ' + z.toPrecision(8) + '\n';
      }
    }
    return str;
  });
}

function waitWriteStream(writeStream: fs.WriteStream): Promise<void> {
  return new Promise((resolve) => {
    writeStream.once('drain', () => { resolve(); });
  });
} 
