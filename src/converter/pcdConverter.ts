import fs from 'fs';
import { once } from 'events';
import readline from 'readline';
import { Vector3 } from 'three';
import { BaseConverter } from './baseConverter'; 
import { PCTree } from '../tree/pcTree';
import { PCTreePoint } from '../tree/pcTreePoint';
import { BoundingBoxType } from '../common/types';
import { MaxConverterThreshold } from '../common/constants';

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

  public async readBoundingBox(path: string): Promise<BoundingBoxType> {
    const bbox: BoundingBoxType = {
      min: new Vector3(Infinity, Infinity, Infinity),
      max: new Vector3(-Infinity, -Infinity, -Infinity)
    }
    await this.readLine(path, (data: string): void => {
      const words = data.split(' ');
      if (!isNaN(parseFloat(words[0]))) {
        const vector = new Vector3(parseFloat(words[0]), parseFloat(words[2]), -parseFloat(words[1]));
        bbox.max.max(vector);
        bbox.min.min(vector);
      }
    });
    return bbox;
  }

  public async read(path: string): Promise<PCTree> {
    let pointNumber: number = 0;
    let pointCount: number = 0;
    const bbox = await this.readBoundingBox(path);
    const tree = new PCTree(bbox);
    await this.readLine(path, (data: string) => {
      const words = data.split(' ');
      if (!isNaN(parseFloat(words[0]))) {
        const point = new PCTreePoint(new Vector3(parseFloat(words[0]), 
          parseFloat(words[2]), -parseFloat(words[1])));
        tree.addPoint(point);
        pointCount++;
        if (pointCount >= MaxConverterThreshold) {
          
        }
      } else {
        switch (words[0]) {
          case 'POINTS': pointNumber = parseInt(words[1]); break;
        }
      }
    });
    return tree;
  }
}
