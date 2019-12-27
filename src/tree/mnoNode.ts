import { OctreeNode } from './octreeNode';
import { Vector3 } from 'three';
import { NodeIndexType } from '../common/types';
import { MNOPoint } from './mnoPoint';
import { GridSize, NodeStackMax } from '../common/constants';
import { bboxToSerializedbboxType } from '../common/common';
import { BoundingBox } from '../common/bbox';
import { MNOTree } from './mnoTree';

// TODO: set some functions static
export abstract class MNONode extends OctreeNode {

  // TODO: the refTree cannot be null, but it will be a little bit hard to instantiate
  protected refTree: MNOTree | null = null;
  protected bbox: BoundingBox;
  private bboxSize: Vector3;
  // grid number: increased by x, y, z
  protected grid: Map<number, MNOPoint> = new Map();
  protected pointStacks: MNOPoint[][] = [[],[],[],[],[],[],[],[]];
  protected isLoaded: boolean;
  protected gridByOrder: [number, MNOPoint][] = [];
  protected pointCount: number = 0;

  constructor(idx: string, bbox: BoundingBox, 
              parentNode: null | MNONode, refTree: MNOTree | null,
              isNew: boolean = true) {
    super(idx, parentNode);
    this.bbox = bbox;
    this.bboxSize = this.bbox.getSize();
    this.refTree = refTree;
    this.isLoaded = isNew;
  }

  protected abstract createNewNode(idx: string, bbox: BoundingBox, parentNode: null | MNONode): MNONode;

  public setRefTree(refTree: MNOTree): void { this.refTree = refTree; }

  public addPointToGrid(gridNumber: number, point: MNOPoint): void { 
    this.grid.set(gridNumber, point);
    const index = this.findInsertPointIndexByOrder(gridNumber);
    if (index !== -1) {
      this.gridByOrder.splice(index, 0, [gridNumber, point]);
    }
  }

  public addPointToStack(stackIndex: number, point: MNOPoint): void { this.pointStacks[stackIndex].push(point); }

  public addPoints(points: MNOPoint[]): void {
    for (const point of points) {
      this.addPoint(point);
    }
  }

  public addPoint(point: MNOPoint): void {
    const grid = this.findGrid(point);
    const gridNumber = this.calcGridNumber(grid);
    if (!this.grid.get(gridNumber)) {
      this.grid.set(gridNumber, point);
      this.pointCount++;
    } else {
      const nodeVector = this.findChildNodeVectorByGrid(grid);
      const nodeNumber = this.calcNodeNumber(nodeVector);
      const node = this.childNodes[nodeNumber];
      if (node) {
        (node as MNONode).addPoint(point);
      } else {
        if (this.pointStacks[nodeNumber].length < NodeStackMax) {
          this.pointStacks[nodeNumber].push(point);
          this.pointCount++;
        } else {
          const childNode = this.createNewNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this);
          childNode.addPoints(this.pointStacks[nodeNumber]);
          this.childNodes[nodeNumber] = childNode;
          this.pointCount -= this.pointStacks[nodeNumber].length;
          this.pointStacks[nodeNumber] = [];
        }
      }
    }
  }

  public getGridEntryIter(): IterableIterator<[number, MNOPoint]> {
    return this.grid.entries();
  }

  // TODO: enable travel functions to use async handler
  // travel all points in grid and stacks
  public travelPoints(handler: (point: MNOPoint, index: number) => void, 
                                includeStack = true): void {
    const gridIter = this.grid.values();
    let result, index = 0;
    while (!(result = gridIter.next()).done) {
      handler(result.value, index++);
    }
    if (includeStack) {
      for (const stack of this.pointStacks) {
        for (const p of stack) {
          handler(p, index++);
        }
      }
    }
  }

  public travelGrid(handler: (point: MNOPoint, index: number, gridNumber: number) => void): void {
    const gridIter = this.grid.entries();
    let result, index = 0;
    while (!(result = gridIter.next()).done) {
      handler(result.value[1], index++, result.value[0]);
    }
  }
  
  public travelStacks(handler: (point: MNOPoint, index: number, stackNumber: number) => void): void {
    let index = 0;
    for (let i = 0; i < 8; i++) {
      for (const p of this.pointStacks[i]) {
        handler(p, index++, i);
      }
    }
  }

  public getGridCount(): number { return this.grid.size; }

  public getStacksCount(): number {
    let count = 0;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }

  public getPointCount(): number { return this.pointCount; }

  public setPointCount(count: number): void { this.pointCount = count; } 

  public getSubtreePointCount(): number {
    let count = this.getPointCount();
    for (const childNode of this.getChildNodes() as MNONode[]) {
      count += childNode.getSubtreePointCount();
    }
    return count;
  }

  public getGrid(): Map<number, MNOPoint> { return this.grid; }

  public getGridPoint(gridNumber: number): MNOPoint | undefined { return this.grid.get(gridNumber); }

  public getGridPointsByOrder(): [number, MNOPoint][] { return this.gridByOrder; }

  public getStacks(): MNOPoint[][] { return this.pointStacks; }

  public getStackCount(): number {
    let count = 0;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }

  public getCenter(): Vector3 { return this.bbox.getCenter(); }

  public getBBox(): BoundingBox { return this.bbox; }

  public getIndex(): NodeIndexType {
    return { 
      idx: this.idx, 
      bbox: bboxToSerializedbboxType(this.bbox), 
      mask: this.getChildrenMask(),
      childIndexes: this.childNodes.map((node) => (node ? (node as MNONode).getIndex() : null)),
      pointCount: this.pointCount
    }; 
  }

  public checkIsLoaded(): boolean { return this.isLoaded; }

  public abstract async load(): Promise<void>; 

  // public async load(): Promise<void> {
  //   // TODO: fix the hardcoding
  //   await deserializeNode('../../output/n' + this.idx, this);
  //   this.isLoaded = true;
  // }

  public async unload(): Promise<void> {
    this.grid.clear();
    this.gridByOrder = [];
    this.pointStacks = [[],[],[],[],[],[],[],[]];
    this.isLoaded = false;
  }

  protected findGrid(point: MNOPoint): Vector3 {
    const currentScope = point.getPosition().clone()
      .sub(this.bbox.getMin().clone());
    const x = Math.floor(currentScope.x * GridSize / this.bboxSize.x);
    const y = Math.floor(currentScope.y * GridSize / this.bboxSize.y);
    const z = Math.floor(currentScope.z * GridSize / this.bboxSize.z);
    return new Vector3(x >= GridSize ? x - 1 : x, y >= GridSize ? y - 1 : y, z >= GridSize ? z - 1 : z);
  }

  protected calcGridNumber(grid: Vector3): number {
    return grid.x + grid.y * GridSize + grid.z * GridSize * GridSize;
  }

  protected findChildNodeVectorByGrid(grid: Vector3): Vector3 {
    const gridToStack = GridSize / 2;
    return new Vector3(Math.floor(grid.x / gridToStack), Math.floor(grid.y / gridToStack), 
      Math.floor(grid.z / gridToStack));
  }

  protected calcNodeNumber(nodeVector: Vector3): number {
    return nodeVector.x + nodeVector.y * 2 + nodeVector.z * 4;
  }

  protected calcBBoxByNode(nodeVector: Vector3): BoundingBox {
    const halfScope = this.bboxSize.clone().divideScalar(2);
    return new BoundingBox(
      this.bbox.getMax().clone().add(new Vector3(halfScope.x * (nodeVector.x - 1), 
        halfScope.y * (nodeVector.y - 1), halfScope.z * (nodeVector.z - 1))),
      this.bbox.getMin().clone().add(new Vector3(halfScope.x * nodeVector.x, 
        halfScope.y * nodeVector.y, halfScope.z * nodeVector.z))
    );
  }

  protected findInsertPointIndexByOrder(gridNumber: number): number {
    // for most situation, the grid number will be larger than all current grid points
    if (this.gridByOrder.length <= 0) { return 0; }
    if (gridNumber > this.gridByOrder[this.gridByOrder.length - 1][0]) {
      return this.gridByOrder.length;
    } else if (gridNumber < this.gridByOrder[0][0]) {
      return 0;
    } else {
      const length = this.gridByOrder.length;
      let left = 0, right = length - 1;
      let index = Math.floor(length / 2);
      while (true) {
        if (this.gridByOrder[index][0] < gridNumber) {
          if (index >= length - 1) { return length; }
          if (this.gridByOrder[index + 1][0] > gridNumber) {
            return index + 1;
          } else {
            left = index;
            index = Math.ceil((right - index) / 2) + index;
          }
        } else if (this.gridByOrder[index][0] > gridNumber) {
          if (index <= 0) { return 0; }
          if (this.gridByOrder[index - 1][0] < gridNumber) {
            return index;
          } else {
            right = index;
            index = Math.floor((index - left) / 2) + left;
          }
        } else {
          return -1;
        }
      }
    }
  }

  protected findPointIndexByOrder(gridNumber: number): number {
    if (this.gridByOrder.length <= 0) { return -1; }
    if (gridNumber > this.gridByOrder[this.gridByOrder.length - 1][0]) {
      return -1;
    } else if (gridNumber < this.gridByOrder[0][0]) {
      return -1;
    } else {
      const length = this.gridByOrder.length;
      let left = 0, right = length - 1;
      let index = Math.floor(length / 2);
      while (true) {
        if (this.gridByOrder[index][0] < gridNumber) {
          left = index;
          if (right === left + 1 && this.gridByOrder[right][0] !== gridNumber) { return -1; }
          index = Math.ceil((right - index) / 2) + index;
        } else if (this.gridByOrder[index][0] > gridNumber) {
          right = index;
          if (right === left + 1 && this.gridByOrder[left][0] !== gridNumber) { return -1; }
          index = Math.floor((index - left) / 2) + left;
        } else {
          return index;
        }
      }
    }
  }
}
