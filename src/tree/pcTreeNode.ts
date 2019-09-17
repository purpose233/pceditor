import { Vector3 } from 'three';
import { BoundingBoxType, PCTreeNodeIndexType } from '../common/types';
import { PCTreePoint } from './pcTreePoint';
import { GridSize, NodeStackMax } from '../common/constants';
import { bboxToSerializedbboxType } from '../common/common';

export class PCTreeNode {

  private idx: string;
  // grid number: increased by x, y, z
  private grid: Map<number, PCTreePoint> = new Map();
  private pointsStacks: PCTreePoint[][] = [[],[],[],[],[],[],[],[]];
  private childNodes: (null | PCTreeNode)[] = [null,null,null,null,null,null,null,null];
  private bbox: BoundingBoxType;
  private bboxScope: Vector3;
  private isLoaded: boolean = true;

  constructor(idx: string, bbox: BoundingBoxType, 
              points?: PCTreePoint[],) {
    this.idx = idx;
    this.bbox = bbox;
    this.bboxScope = this.bbox.max.clone().add(this.bbox.min.clone().negate());
    if (points) {
      for (const point of points) {
        this.addPoint(point);
      }
    }
  }

  public addPointToGrid(gridNumber: number, point: PCTreePoint): void { this.grid.set(gridNumber, point); }

  public addPointToStack(stackIndex: number, point: PCTreePoint): void { this.pointsStacks[stackIndex].push(point); }

  public addPoint(point: PCTreePoint): void {
    const grid = this.findGrid(point);
    const gridNumber = this.calcGridNumber(grid);
    if (!this.grid.get(gridNumber)) {
      this.grid.set(gridNumber, point);
    } else {
      const nodeVector = this.findChildNodeVectorByGrid(grid);
      const nodeNumber = this.calcNodeNumber(nodeVector);
      const node = this.childNodes[nodeNumber];
      if (node) {
        node.addPoint(point);
      } else {
        if (this.pointsStacks[nodeNumber].length < NodeStackMax) {
          this.pointsStacks[nodeNumber].push(point);
        } else {
          this.childNodes[nodeNumber] = new PCTreeNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this.pointsStacks[nodeNumber]);
          this.pointsStacks[nodeNumber] = [];
        }
      }
    }
  }

  // travel all points in grid and stacks
  public travelPoints(handler: (point: PCTreePoint, index: number) => void, 
                                includeStack = true): void {
    const gridIter = this.grid.values();
    let result, index = 0;
    while(!(result = gridIter.next()).done) {
      handler(result.value, index++);
    }
    if (includeStack) {
      for (const stack of this.pointsStacks) {
        for (const p of stack) {
          handler(p, index++);
        }
      }
    }
  }

  public getPointCount(): number {
    let count = this.grid.size;
    for (const stack of this.pointsStacks) {
      count += stack.length;
    }
    return count;
  }

  public getChildNodes(): PCTreeNode[] {
    const nodes: PCTreeNode[] = [];
    if (this.childNodes) {
      for (const node of this.childNodes) {
        if (node) { nodes.push(node); }
      }
    }
    return nodes;
  }

  public setChildNode(index: number, node: PCTreeNode) { this.childNodes[index] = node; }

  public getGrid(): Map<number, PCTreePoint> { return this.grid; }

  public getStacks(): PCTreePoint[][] { return this.pointsStacks; }

  public getStackCount(): number {
    let count = 0;
    for (const stack of this.pointsStacks) {
      count += stack.length;
    }
    return count;
  }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getChildrenMask(): number {
    let mask = 0;
    if (this.childNodes) {
      for (let i = 0; i < this.childNodes.length; i++) {
        mask = mask | (this.childNodes[i] ? 1 : 0) << i;
      }
    }
    return mask;
  }

  public getIdx(): string { return this.idx; }

  public getIndex(): PCTreeNodeIndexType { 
    // const childNodes: PCTreeNodeIndexType[] = [];
    return { 
      idx: this.idx, 
      bbox: bboxToSerializedbboxType(this.bbox), 
      mask: this.getChildrenMask(),
      childIndexes: this.childNodes.map((node) => (node ? node.getIndex() : null))
    }; 
  }

  public load(): void {
    
  }

  public unload(): void {
    this.grid.clear();
    this.pointsStacks = [[],[],[],[],[],[],[],[]];
    this.isLoaded = false;
  }

  private findGrid(point: PCTreePoint): Vector3 {
    const currentScope = point.getPosition().clone()
      .add(this.bbox.min.clone().negate());
    const x = Math.floor(currentScope.x * GridSize / this.bboxScope.x);
    const y = Math.floor(currentScope.y * GridSize / this.bboxScope.y);
    const z = Math.floor(currentScope.z * GridSize / this.bboxScope.z);
    return new Vector3(x, y, z);
  }

  private calcGridNumber(grid: Vector3): number {
    return grid.x + grid.y * GridSize + grid.z * GridSize * GridSize;
  } 

  private findChildNodeVectorByGrid(grid: Vector3): Vector3 {
    return new Vector3(Math.floor(grid.x / 64), Math.floor(grid.y / 64), 
      Math.floor(grid.z / 64));
  }

  private calcNodeNumber(nodeVector: Vector3): number {
    return nodeVector.x + nodeVector.y * 2 + nodeVector.z * 4;
  }

  private calcBBoxByNode(nodeVector: Vector3): BoundingBoxType {
    const halfScope = this.bboxScope.clone().divideScalar(2);
    return {
      min: this.bbox.min.clone().add(new Vector3(halfScope.x * nodeVector.x, 
        halfScope.y * nodeVector.y, halfScope.z * nodeVector.z)),
      max: this.bbox.max.clone().add(new Vector3(halfScope.x * (nodeVector.x - 1), 
        halfScope.y * (nodeVector.y - 1), halfScope.z * (nodeVector.z - 1)))
    };
  }
}
