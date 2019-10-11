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

  private grid: Map<number, RenderPoint> = new Map();
  // store points in eight stacks of render node
  private pointStacks: RenderPoint[][] = [[],[],[],[],[],[],[],[]];

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
  
  public getRefNode(): RenderNode { return this.refNode; }

  public getGridEntryIter(): IterableIterator<[number, RenderPoint]> {
    return this.grid.entries();
  }
  
  public getStacks(): RenderPoint[][] { return this.pointStacks; }
  
  public selectGridPoint(point: RenderPoint, gridNumber: number): void {
    point.select();
    this.grid.set(gridNumber, point);
  }
  
  public unselectGridPoint(gridNumber: number): void {
    const point = this.grid.get(gridNumber);
    if (point) { point.unselect(); }
    this.grid.delete(gridNumber);
  }
  
  public selectStackPoint(point: RenderPoint, stackNumber: number): void {
    point.select();
    this.pointStacks[stackNumber].push(point);
  }
  
  public unselectStackPoint(point: RenderPoint, stackNumber: number): void {
    point.unselect();
    this.pointStacks[stackNumber].splice(this.pointStacks[stackNumber].indexOf(point));
  }
  
  public getPointCount(): number {
    let count = this.grid.size;
    for (const stack of this.pointStacks) {
      count += stack.length;
    }
    return count;
  }
  
  public updateRender(scene: Scene): void {
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
        child.clear();
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
}
