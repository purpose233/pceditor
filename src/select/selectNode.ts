import { OctreeNode } from '../tree/octreeNode';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';
import { Scene } from 'three';

export class SelectNode extends OctreeNode {
  
  private refNode: RenderNode;
  // whether the node is updated after selector changes
  private isDirty: boolean = false;
  // whether the node is reached in updating operation
  private isReached: boolean = false;
  // whether the node need further diffing cuz the refNode is not loaded
  private needDiff: boolean = false;
  // whether the node is ref node unloaded and need to be reconnected
  private needReconnect: boolean = false;

  private grid: Map<number, RenderPoint> = new Map();
  // store points in eight stacks of render node
  private pointStacks: RenderPoint[][] = [[],[],[],[],[],[],[],[]];

  private gridByOrder: [number, RenderPoint][] = [];

  constructor(idx: string, parentNode: SelectNode | null, refNode: RenderNode) {
    super(idx, parentNode);
    this.refNode = refNode;
  }
  
  public checkIsDirty(): boolean { return this.isDirty; }
  
  public setClean(): void { this.isDirty = false; }
  
  public setDirty(): void { this.isDirty = true; }
  
  public checkIsReached(): boolean { return this.isReached; }
  
  public setReached(): void { this.isReached = true; }
  
  public setUnreached(): void { this.isReached = false; }
  
  public checkNeedDiff(): boolean { return this.needDiff }
  
  public setNeedDiff(): void { this.needDiff = true; }
  
  public setNotNeedDiff(): void { this.needDiff = false; }

  public checkNeedReconnect(): boolean { return this.needReconnect; }

  public setNeedReconnect(): void { this.needReconnect = true; }

  public setNotNeedReconnect(): void { this.needReconnect = false; }
  
  public getRefNode(): RenderNode { return this.refNode; }

  public getGridEntryIter(): IterableIterator<[number, RenderPoint]> {
    return this.grid.entries();
  }

  public getGridPointsByOrder(): [number, RenderPoint][] { return this.gridByOrder; }

  public getGridCount(): number { return this.grid.size; }
  
  public getStacks(): RenderPoint[][] { return this.pointStacks; }
  
  public selectGridPoint(point: RenderPoint, gridNumber: number): void {
    point.select();
    this.grid.set(gridNumber, point);
    const index = this.findInsertPointIndexByOrder(gridNumber);
    if (index !== -1) {
      this.gridByOrder.splice(index, 0, [gridNumber, point]);
    }
  }
  
  public unselectGridPoint(gridNumber: number): void {
    const point = this.grid.get(gridNumber);
    if (point) { point.unselect(); }
    this.grid.delete(gridNumber);
    const index = this.findPointIndexByOrder(gridNumber);
    if (index !== -1) { this.gridByOrder.splice(index, 1); }
  }
  
  public selectStackPoint(point: RenderPoint, stackNumber: number): void {
    point.select();
    this.pointStacks[stackNumber].push(point);
  }
  
  public unselectStackPoint(point: RenderPoint, stackNumber: number): void {
    point.unselect();
    this.pointStacks[stackNumber].splice(this.pointStacks[stackNumber].indexOf(point), 1);
  }
  
  public getPointCount(): number {
    let count = this.grid.size;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }

  public getSubtreePointCount(): number {
    let count = this.getPointCount();
    for (const childNode of this.getChildNodes() as SelectNode[]) {
      count += childNode.getSubtreePointCount();
    }
    return count;
  }
  
  public updateRender(scene: Scene): void {
    // TODO: clear unreached node
    if (this.isDirty) {
      this.refNode.updateRender(scene);
      this.isDirty = false;
    }
    // Even if parent node is clean, it doesn't mean children are clean.
    for (const child of this.getChildNodes() as SelectNode[]) {
      child.updateRender(scene);
    }
  }

  // clear will clear all nodes in subtree
  public clear(isRecursive: boolean = true): void {
    this.isReached = false;
    this.isDirty = this.isDirty || this.getPointCount() > 0;
    const gridIter = this.grid.values();
    let result;
    while (!(result = gridIter.next()).done) {
      (result.value as RenderPoint).unselect();
    }
    for (const stack of this.pointStacks) {
      for (const p of stack) {
        p.unselect();
      }
    }
    this.grid.clear();
    this.pointStacks = [[],[],[],[],[],[],[],[]];
    if (isRecursive) {
      // If the parent node is not reached, the children won't be reached neither.
      for (const child of this.getChildNodes() as SelectNode[]) {
        child.clear(true);
      }
    }
  }

  // delete points in refNode
  public delete(): void {
    const iter = this.grid.keys();
    let result;
    while (!(result = iter.next()).done) {
      const gNumber: number = result.value;
      this.refNode.deleteGridPoint(gNumber);
    }
    for (let i = 0; i < 8; i++) {
      this.refNode.deleteStackPoints(this.pointStacks[i], i);
    }
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
