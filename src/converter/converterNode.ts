import { BaseNode } from '../tree/baseNode';
import { BoundingBoxType } from '../common/types';
import { ConverterPoint } from './converterPoint';
import { ConverterTree } from './converterTree';
import { NodeStackMax, MaxConverterThreshold } from '../common/constants';

export class ConverterNode extends BaseNode {
  
  private refTree: ConverterTree;

  constructor(idx: string, bbox: BoundingBoxType, 
              parentNode: null | ConverterNode, refTree: ConverterTree,
              points?: ConverterPoint[]) {
    super(idx, bbox, parentNode, points);
    this.refTree = refTree;
  }

  public addPoint(point: ConverterPoint): void {
    if (!this.isLoaded) { this.load(); }

    let isInCurrentNode: boolean = false;
    const grid = this.findGrid(point);
    const gridNumber = this.calcGridNumber(grid);
    
    if (!this.grid.get(gridNumber)) {
      this.grid.set(gridNumber, point);
      isInCurrentNode = true;
    } else {
      const nodeVector = this.findChildNodeVectorByGrid(grid);
      const nodeNumber = this.calcNodeNumber(nodeVector);
      const node = this.childNodes[nodeNumber];
      if (node) {
        node.addPoint(point);
      } else {
        if (this.pointsStacks[nodeNumber].length < NodeStackMax) {
          this.pointsStacks[nodeNumber].push(point);
          isInCurrentNode = true;
        } else {
          this.childNodes[nodeNumber] = new BaseNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this, this.pointsStacks[nodeNumber]);
          this.pointsStacks[nodeNumber] = [];
        }
      }
    }

    if (isInCurrentNode) {
      this.refTree.changeLoadedCount(1);
      if (this.refTree.getLoadedCount() >= MaxConverterThreshold) {
        this.refTree.serialize(this);
      }
    }
  }

  public unload() {
    super.unload();
    this.refTree.changeLoadedCount(-this.getPointCount());
  }
}