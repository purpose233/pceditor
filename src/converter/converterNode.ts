import { BaseNode } from '../tree/baseNode';
import { BoundingBoxType } from '../common/types';
import { ConverterPoint } from './converterPoint';
import { ConverterTree } from './converterTree';
import { NodeStackMax, MaxConverterThreshold } from '../common/constants';
import { BasePoint } from '../tree/basePoint';
import { deserializeNode } from '../common/serialize';

export class ConverterNode extends BaseNode {
  
  private refTree: ConverterTree;

  constructor(idx: string, bbox: BoundingBoxType, 
              parentNode: null | BaseNode, refTree: ConverterTree,
              points?: ConverterPoint[]) {
    super(idx, bbox, parentNode, points);
    this.refTree = refTree;
  }

  protected createNode(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode, 
                       points?: BasePoint[]): BaseNode {
    return new ConverterNode(idx, bbox, parentNode, this.refTree, points);
  };

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
          this.childNodes[nodeNumber] = this.createNode(this.idx + nodeNumber,
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

  public load(): void {
    // TODO: fix the hardcoding
    deserializeNode('../../output/n' + this.idx, this, true);
    this.isLoaded = true;
    this.refTree.changeLoadedCount(this.getPointCount());
  }

  public unload(): void {
    super.unload();
    this.refTree.changeLoadedCount(-this.getPointCount());
  }
}