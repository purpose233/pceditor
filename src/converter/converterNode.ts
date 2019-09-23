import { BaseNode } from '../tree/baseNode';
import { BoundingBoxType } from '../common/types';
import { ConverterPoint } from './converterPoint';
import { ConverterTree } from './converterTree';
import { NodeStackMax, MaxConverterThreshold, ExportDataPath } from '../common/constants';
import { deserializeNode } from '../common/serialize';

export class ConverterNode extends BaseNode {
  
  private refTree: ConverterTree;

  constructor(idx: string, bbox: BoundingBoxType, 
              parentNode: null | BaseNode, refTree: ConverterTree,
              isNew: boolean = true) {
    super(idx, bbox, parentNode, isNew);
    this.refTree = refTree;
  }

  protected createNewNode(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode): BaseNode {
    return new ConverterNode(idx, bbox, parentNode, this.refTree);
  };

  public async addPoint(point: ConverterPoint): Promise<void> {
    if (!this.isLoaded) { await this.load(); }

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
          const childNode = this.createNewNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this);
          childNode.addPoints(this.pointsStacks[nodeNumber]);
          this.childNodes[nodeNumber] = childNode;
          this.pointsStacks[nodeNumber] = [];
        }
      }
    }

    if (isInCurrentNode) {
      this.refTree.changeLoadedCount(1);
      if (this.refTree.getLoadedCount() >= MaxConverterThreshold) {
        this.refTree.unloadNodeTree(this);
      }
    }
  }

  public async load(): Promise<void> {
    await deserializeNode(ExportDataPath + this.idx, this, true);
    this.isLoaded = true;
    this.refTree.changeLoadedCount(this.getPointCount());
  }

  public async unload(): Promise<void> {
    await super.unload();
    this.refTree.changeLoadedCount(-this.getPointCount());
  }
}