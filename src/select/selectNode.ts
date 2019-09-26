import { OctreeNode } from '../tree/octreeNode';
import { RenderNode } from '../render/renderNode';
import { RenderPoint } from '../render/renderPoint';

export class SelectNode extends OctreeNode {
  
  private refMNONode: RenderNode;
  private isDirty: boolean = false;
  private isReached: boolean = false;

  private grid: Map<number, RenderPoint> = new Map();
  // store points in eight stacks of render node
  private pointStacks: RenderPoint[][] = [[],[],[],[],[],[],[],[]];

  constructor(idx: string, parentNode: SelectNode | null, refMNONode: RenderNode) {
    super(idx, parentNode);
    this.refMNONode = refMNONode;
  }

  public clear(): void {
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
  }

  public checkIsDirty(): boolean { return this.isDirty; }

  public setClean(): void { this.isDirty = true; }

  public setDirty(): void { this.isDirty = false; }

  public checkIsReached(): boolean { return this.isReached; }

  public setReached(): void { this.isReached = true; }

  public setUnreached(): void { this.isReached = false; }

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
}
