import { OctreeNode } from './octreeNode';
import { Vector3 } from 'three';
import { BoundingBoxType, NodeIndexType } from '../common/types';
import { MNOPoint } from './mnoPoint';
import { GridSize, NodeStackMax } from '../common/constants';
import { bboxToSerializedbboxType } from '../common/common';

// TODO: set some functions static
export abstract class MNONode extends OctreeNode {

  protected bbox: BoundingBoxType;
  private bboxScope: Vector3;
  // grid number: increased by x, y, z
  protected grid: Map<number, MNOPoint> = new Map();
  protected pointStacks: MNOPoint[][] = [[],[],[],[],[],[],[],[]];
  protected isLoaded: boolean;

  constructor(idx: string, bbox: BoundingBoxType, parentNode: null | MNONode,
              isNew: boolean = true) {
    super(idx, parentNode);
    this.bbox = bbox;
    this.bboxScope = this.bbox.max.clone().add(this.bbox.min.clone().negate());
    this.isLoaded = isNew;
  }

  protected abstract createNewNode(idx: string, bbox: BoundingBoxType, parentNode: null | MNONode): MNONode;

  public addPointToGrid(gridNumber: number, point: MNOPoint): void { this.grid.set(gridNumber, point); }

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
    } else {
      const nodeVector = this.findChildNodeVectorByGrid(grid);
      const nodeNumber = this.calcNodeNumber(nodeVector);
      const node = this.childNodes[nodeNumber];
      if (node) {
        (node as MNONode).addPoint(point);
      } else {
        if (this.pointStacks[nodeNumber].length < NodeStackMax) {
          this.pointStacks[nodeNumber].push(point);
        } else {
          const childNode = this.createNewNode(this.idx + nodeNumber,
            this.calcBBoxByNode(nodeVector), this);
          childNode.addPoints(this.pointStacks[nodeNumber]);
          this.childNodes[nodeNumber] = childNode;
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

  public getPointCount(): number {
    let count = this.grid.size;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }

  public getGrid(): Map<number, MNOPoint> { return this.grid; }

  public getGridPoint(gridNumber: number): MNOPoint | undefined { return this.grid.get(gridNumber); }

  public getStacks(): MNOPoint[][] { return this.pointStacks; }

  public getStackCount(): number {
    let count = 0;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getIndex(): NodeIndexType {
    return { 
      idx: this.idx, 
      bbox: bboxToSerializedbboxType(this.bbox), 
      mask: this.getChildrenMask(),
      childIndexes: this.childNodes.map((node) => (node ? (node as MNONode).getIndex() : null))
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
    this.pointStacks = [[],[],[],[],[],[],[],[]];
    this.isLoaded = false;
  }

  protected findGrid(point: MNOPoint): Vector3 {
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
