import { Vector3 } from 'three';
import { BoundingBoxType } from './types';

const GridSize = 128;
const NodeStackMax = 128;

export class PCTreePoint {
  private position: Vector3;
  // color?: 

  constructor(position: Vector3) {
    this.position = position;
  }

  public getPosition(): Vector3 { return this.position; }

  public isInBBox(bbox: BoundingBoxType): boolean {
    return this.position.x > bbox.min.x && this.position.x < bbox.max.x 
      && this.position.y > bbox.min.y && this.position.y < bbox.max.y 
      && this.position.z > bbox.min.z && this.position.z < bbox.max.z;
  }
}

export class PCTreeNode {

  // grid number: increased by x, y, z
  private grid: Map<number, PCTreePoint> = new Map();
  private pointsStacks: PCTreePoint[][] = [[],[],[],[],[],[],[],[]];
  private childNodes: (null | PCTreeNode)[] = [];
  private bbox: BoundingBoxType;
  private bboxScope: Vector3;
  private isLoaded: boolean = true;

  constructor(bbox: BoundingBoxType, points?: PCTreePoint[]) {
    this.bbox = bbox;
    this.bboxScope = this.bbox.max.clone().add(this.bbox.min.clone().negate());
    if (points) {
      for (const point of points) {
        this.addPoint(point);
      }
    }
  }

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
          this.childNodes[nodeNumber] = new PCTreeNode(
            this.calcBBoxByNode(nodeVector), this.pointsStacks[nodeNumber]);
          this.pointsStacks[nodeNumber] = [];
        }
      }
    }
  }

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

export class PCTree {
  private bbox: BoundingBoxType; 
  private rootNode: PCTreeNode;
  private pointCount: number = 0;

  constructor(bbox: BoundingBoxType) {
    this.bbox = bbox;
    this.rootNode = new PCTreeNode(bbox);
  }

  public addPoint(point: PCTreePoint): void {
    this.pointCount++;
    if (point.isInBBox(this.bbox)) {
      this.rootNode.addPoint(point);
    } else {
      // enlarge the bbox
    }
  }

  public getRootNode(): PCTreeNode { return this.rootNode; }

  public getBBox(): BoundingBoxType { return this.bbox; }

  public getPointCount(): number { return this.pointCount; }
}
