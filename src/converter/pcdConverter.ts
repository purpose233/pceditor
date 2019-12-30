import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Vector3 } from 'three';
import { BaseConverter } from './baseConverter'; 
import { ConverterTree } from './converterTree';
import { ConverterPoint } from './converterPoint';
import { serializeTree } from '../common/serialize';
import { BoundingBox } from '../common/bbox';

export class PCDConverter extends BaseConverter {

  private async readLine(path: string, handler: Function): Promise<void> {
    try {
      const input = fs.createReadStream(path, {
        encoding: 'utf-8'
      });
      const rl = readline.createInterface({
        input, crlfDelay: Infinity
      });
      // rl.on('line', (data) => {
      //   handler(data);
      // });
      // await once(rl, 'close');
      for await (const line of rl) {
        handler(line);
      }
    } catch(e) {
      console.log(e);
    }
  }

  public async readBoundingBox(path: string): Promise<BoundingBox> {
    const bbox: BoundingBox = new BoundingBox(
      new Vector3(-Infinity, -Infinity, -Infinity),
      new Vector3(Infinity, Infinity, Infinity)
    );
    await this.readLine(path, (data: string): void => {
      const words = data.split(' ');
      if (!isNaN(parseFloat(words[0]))) {
        const vector = new Vector3(parseFloat(words[0]), parseFloat(words[2]), -parseFloat(words[1]));
        // TODO: directly modifying bbox private attributes through get function is bad design.
        bbox.getMax().max(vector);
        bbox.getMin().min(vector);
      }
    });
    bbox.updateAttributes();
    return bbox;
  }

  public createProjectDir(dirPath: string): void {
    const projectPath = path.resolve(dirPath, '../');
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath);
    }
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }

  public async read(filePath: string, exportPath: string): Promise<ConverterTree> {
    this.createProjectDir(exportPath);
    let pointNumber: number = 0;
    let pointCount: number = 0;
    const bbox = await this.readBoundingBox(filePath);
    const tree = new ConverterTree(exportPath, bbox);
    await this.readLine(filePath, (data: string) => {
      const words = data.split(' ');
      if (!isNaN(parseFloat(words[0]))) {
        const point = new ConverterPoint(new Vector3(parseFloat(words[0]), 
          parseFloat(words[2]), -parseFloat(words[1])));
        tree.addPoint(point);
        pointCount++;
      } else {
        switch (words[0]) {
          case 'POINTS': pointNumber = parseInt(words[1]); break;
        }
      }
    });
    console.log('Read points: ' + pointCount);
    await serializeTree(tree);
    return tree;
  }
}
