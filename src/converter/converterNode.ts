import { MNONode } from '../tree/mnoNode';
import { ConverterPoint } from './converterPoint';
import { ConverterTree } from './converterTree';
import { NodeStackMax, MaxConverterThreshold, ExportDataPath } from '../common/constants';
import { deserializeNode } from '../common/serialize';
import { BoundingBox } from '../common/bbox';

export class ConverterNode extends MNONode {
  
  // TODO: the refTree cannot be null, but it will be a little bit hard to instantiate
  private refTree: ConverterTree | null;

  constructor(idx: string, bbox: BoundingBox, 
              parentNode: null | ConverterNode, refTree: ConverterTree | null,
              isNew: boolean = true) {
    super(idx, bbox, parentNode, isNew);
    this.refTree = refTree;
  }

  public setRefTree(refTree: ConverterTree): void { this.refTree = refTree; }

  protected createNewNode(idx: string, bbox: BoundingBox, parentNode: null | ConverterNode): MNONode {
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
        (node as MNONode).addPoint(point);
      } else {
        if (this.pointStacks[nodeNumber].length < NodeStackMax) {
          this.pointStacks[nodeNumber].push(point);
          isInCurrentNode = true;
        } else {
          const childNode = this.createNewNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this);
          childNode.addPoints(this.pointStacks[nodeNumber]);
          this.childNodes[nodeNumber] = childNode;
          this.pointStacks[nodeNumber] = [];
        }
      }
    }

    if (isInCurrentNode) {
      (this.refTree as ConverterTree).changeLoadedCount(1);
      if ((this.refTree as ConverterTree).getLoadedCount() >= MaxConverterThreshold) {
        (this.refTree as ConverterTree).unloadNodeTree(this);
      }
    }
  }

  public async load(): Promise<void> {
    await deserializeNode(ExportDataPath + this.idx, this, true);
    this.isLoaded = true;
    (this.refTree as ConverterTree).changeLoadedCount(this.getPointCount());
  }

  public async unload(): Promise<void> {
    await super.unload();
    (this.refTree as ConverterTree).changeLoadedCount(-this.getPointCount());
  }
}