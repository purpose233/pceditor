import { Vector3 } from 'three';
import { BoundingBoxType, NodeIndexType } from '../common/types';
import { BasePoint } from './basePoint';
import { BaseTree } from './baseTree';
import { GridSize, NodeStackMax } from '../common/constants';
import { bboxToSerializedbboxType } from '../common/common';
import { deserializeNode } from '../common/serialize';

export abstract class BaseNode {

  protected idx: string;
  // grid number: increased by x, y, z
  protected parentNode: null | BaseNode;
  protected bbox: BoundingBoxType;
  protected bboxScope: Vector3;
  protected grid: Map<number, BasePoint> = new Map();
  protected pointsStacks: BasePoint[][] = [[],[],[],[],[],[],[],[]];
  protected childNodes: (null | BaseNode)[] = [null,null,null,null,null,null,null,null];
  protected isLoaded: boolean = true;

  constructor(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode,
              points?: BasePoint[]) {
    this.idx = idx;
    this.bbox = bbox;
    this.parentNode = parentNode;
    this.bboxScope = this.bbox.max.clone().add(this.bbox.min.clone().negate());
    if (points) {
      for (const point of points) {
        this.addPoint(point);
      }
    }
  }

  protected abstract createNode(idx: string, bbox: BoundingBoxType, parentNode: null | BaseNode, points?: BasePoint[]): BaseNode;

  public addPointToGrid(gridNumber: number, point: BasePoint): void { this.grid.set(gridNumber, point); }

  public addPointToStack(stackIndex: number, point: BasePoint): void { this.pointsStacks[stackIndex].push(point); }

  public addPoint(point: BasePoint): void {
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
          this.childNodes[nodeNumber] = this.createNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this, this.pointsStacks[nodeNumber]);
          this.pointsStacks[nodeNumber] = [];
        }
      }
    }
  }

  // travel all points in grid and stacks
  public travelPoints(handler: (point: BasePoint, index: number) => void, 
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

  public getChildNodes(): BaseNode[] {
    const nodes: BaseNode[] = [];
    if (this.childNodes) {
      for (const node of this.childNodes) {
        if (node) { nodes.push(node); }
      }
    }
    return nodes;
  }

  public getParentNode(): null | BaseNode { return this.parentNode; }

  public setChildNode(index: number, node: BaseNode) { this.childNodes[index] = node; }

  public getGrid(): Map<number, BasePoint> { return this.grid; }

  public getStacks(): BasePoint[][] { return this.pointsStacks; }

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

  public getIndex(): NodeIndexType {
    return { 
      idx: this.idx, 
      bbox: bboxToSerializedbboxType(this.bbox), 
      mask: this.getChildrenMask(),
      childIndexes: this.childNodes.map((node) => (node ? node.getIndex() : null))
    }; 
  }

  public checkIsLoaded(): boolean { return this.isLoaded; }

  public load(): void {
    // fix the hardcoding
    deserializeNode('../../output/n' + this.idx, this);
    this.isLoaded = true;
  }

  public unload(): void {
    this.grid.clear();
    this.pointsStacks = [[],[],[],[],[],[],[],[]];
    this.isLoaded = false;
  }

  protected findGrid(point: BasePoint): Vector3 {
    const currentScope = point.getPosition().clone()
      .add(this.bbox.min.clone().negate());
    const x = Math.floor(currentScope.x * GridSize / this.bboxScope.x);
    const y = Math.floor(currentScope.y * GridSize / this.bboxScope.y);
    const z = Math.floor(currentScope.z * GridSize / this.bboxScope.z);
    return new Vector3(x, y, z);
  }

  protected calcGridNumber(grid: Vector3): number {
    return grid.x + grid.y * GridSize + grid.z * GridSize * GridSize;
  } 

  protected findChildNodeVectorByGrid(grid: Vector3): Vector3 {
    return new Vector3(Math.floor(grid.x / 64), Math.floor(grid.y / 64), 
      Math.floor(grid.z / 64));
  }

  protected calcNodeNumber(nodeVector: Vector3): number {
    return nodeVector.x + nodeVector.y * 2 + nodeVector.z * 4;
  }

  protected calcBBoxByNode(nodeVector: Vector3): BoundingBoxType {
    const halfScope = this.bboxScope.clone().divideScalar(2);
    return {
      min: this.bbox.min.clone().add(new Vector3(halfScope.x * nodeVector.x, 
        halfScope.y * nodeVector.y, halfScope.z * nodeVector.z)),
      max: this.bbox.max.clone().add(new Vector3(halfScope.x * (nodeVector.x - 1), 
        halfScope.y * (nodeVector.y - 1), halfScope.z * (nodeVector.z - 1)))
    };
  }
}
